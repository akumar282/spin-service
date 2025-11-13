import type { Route } from './+types/home'
import React, { type ChangeEventHandler, useContext, useEffect, useState } from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import { ArtistResultComponent, ResultComponent } from '~/components/ResultComponent'
import debounce from 'lodash/debounce'
import {
  type AllNotifications,
  type Artist,
  type ArtistNotification,
  type LabelNotification,
  type Master,
  type Release,
  type ReleaseNotification, type SearchResult, unwrap, type User
} from '~/types'
import { Tags } from '~/components/Tags'
import { SpinClient } from '~/api/client'
import { AuthContext } from '~/components/AuthContext'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Filters() {
  const userContext = useContext(AuthContext)
  const client = new SpinClient()

  const [results, setResults] = useState<(Artist | Release | Master)[]>([])
  const [releaseFilters, setReleaseFilters] = useState<ReleaseNotification[]>([])
  const [labelFilters, setLabelFilters] = useState<LabelNotification[]>([])
  const [artistFilters, setArtistFilters] = useState<ArtistNotification[]>([])
  const [allTags, setAllTags] = useState<AllNotifications[]>([])
  const [userData, setUserData] = useState<User['data']| null>(null)

  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchUser = async () => {
      if (userContext?.user?.data) {
        const data = userContext.user.data
        setUserData(data)
      }
    }

    fetchUser().catch()
  }, [userContext])

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const data = unwrap(await client.getData<SearchResult>(`search/search?q=${e.target.value}`))
    console.log(data)
    const filteredResults = data.results.filter((x: (Artist | Release | Master)) => x.type != 'master')
    setResults(filteredResults)
  }

  const debounced = debounce(onChange, 700)

  function removeFromAll<T>(tag: T) {
    setArtistFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setLabelFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setReleaseFilters((prevTags) => prevTags.filter((t) => t !== tag))
  }

  function handleClick<T>(
    data: T,
    list: T[],
  ) {
    switch (list) {
      case releaseFilters:
        setReleaseFilters(prev =>
          prev.some(t => JSON.stringify(t) === JSON.stringify(data))
            ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(data))
            : [...prev, data as ReleaseNotification]
        )
        break
      case artistFilters:
        setArtistFilters(prev =>
          prev.some(t => JSON.stringify(t) === JSON.stringify(data))
            ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(data))
            : [...prev, data as ArtistNotification]
        )
        break
      case labelFilters:
        setLabelFilters(prev =>
          prev.some(t => JSON.stringify(t) === JSON.stringify(data))
            ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(data))
            : [...prev, data as LabelNotification]
        )
        break
      case allTags:
        setAllTags(prev =>
          prev.some(t => JSON.stringify(t) === JSON.stringify(data))
            ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(data))
            : [...prev, data as AllNotifications]
        )
        removeFromAll(data)
        break
    }
    setAllTags(prev =>
      prev.some(t => JSON.stringify(t) === JSON.stringify(data))
        ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(data))
        : [...prev, data as AllNotifications]
    )
  }

  return (
    <main>
      <div className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full items-center max-w-[116rem] flex flex-col'>
          <div className='lg:w-8/10 w-[97%] dark:bg-gray-300 dark:text-black rounded-xl border border-orange-400 dark:border-indigo-500 border-3 flex flex-col space-y-4 mt-10 bg-white'>
            <h1 className='mt-5 text-2xl mx-auto text-center'>Set Notification Filters</h1>
            <h3 className='mx-auto w-[98%] px-2 text-center'>Manage filters so you can be notified for what you are looking for and what you want</h3>
            <div className='w-full flex flex-col items-center'>
              <div className='w-[97%] space-y-2 my-3'>
                <h3 className='mb-4 text-center'>
                  Your current Filters:
                </h3>
                <div className='lg:space-x-2 md:space-x-2 space-y-2'>
                  {
                    allTags.map((tag, index) => {
                      if ('album' in tag) {
                        return <Tags
                          className='dark:bg-indigo-300 bg-orange-200 p-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.album + ' ' + tag.type}
                          onClick={() => handleClick(tag, releaseFilters)}
                        />
                      }
                      if ('artist' in tag) {
                        return <Tags
                          className='dark:bg-green-300 bg-green-200 p-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.artist}
                          onClick={() => handleClick(tag, artistFilters)}
                        />
                      }
                      if ('label' in tag) {
                        return <Tags
                          className='dark:bg-blue-300 bg-blue-300 p-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.label}
                          onClick={() => handleClick(tag, labelFilters)}
                        />
                      }
                    })
                  }
                </div>
                <input
                className='text-start py-1 bg-slate-100 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 w-full'
                placeholder='Search for Artists, Releases, or Labels'
                type='text'
                onChange={debounced}
                />
              </div>
              {
                results.map((x, index) => {
                  if(x.type === 'artist') {
                    return <ArtistResultComponent
                      key={index}
                      _typename={x.type}
                      title={x.title}
                      subtitle={x.title}
                      thumbnail={x.thumb}
                      data={x}
                      linkTo={x.uri}
                      checked={artistFilters.some(t => t.artist === x.title && t.type === 'artist')}
                      buttonFunction={() => handleClick({ artist: x.title, type: 'artist' }, artistFilters)}
                    />
                  }
                  if(x.type === 'release' && x.country === 'US') {
                    return <ResultComponent
                      key={index}
                      _typename={x.type}
                      title={x.title}
                      subtitle={x.title}
                      thumbnail={x.thumb}
                      data={x}
                      year={x.year}
                      format={x.format}
                      linkTo={x.uri}
                      checked={releaseFilters.some(t => t.album === x.title && t.type === x.format[0])}
                      buttonFunction={() => handleClick({ album: x.title, type: x.format[0] }, releaseFilters)}
                    />
                  }
                })
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}