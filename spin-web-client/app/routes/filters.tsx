import type { Route } from './+types/home'
import React, { type ChangeEventHandler, useContext, useEffect, useMemo, useRef, useState } from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import { ArtistResultComponent, ResultComponent } from '~/components/ResultComponent'
import debounce from 'lodash/debounce'
import {
  type AllNotifications,
  type Artist,
  type ArtistNotification,
  type CustomNotification,
  type GenreNotification,
  type LabelNotification,
  type Master,
  type Release,
  type ReleaseNotification,
  type SearchResult,
  type User,
  unwrap
} from '~/types'
import { Tags } from '~/components/Tags'
import { SpinClient } from '~/api/client'
import { AuthContext } from '~/components/AuthContext'
import spinLogo from '~/assets/spinLogo.png'
import spinLogoDark from '~/assets/spinLogoDark.png'
import Alert from '~/components/Alert'
import { updateUser } from '~/functions'
import plus from '~/assets/plus.svg'
import _ from 'lodash'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'filters | spin-service' },
    { name: 'spin service filters and preferences', content: 'set your filters and preferences for stuff you want to be notified for' },
  ]
}

export default function Filters() {
  const userContext = useContext(AuthContext)
  const client = new SpinClient()
  const currentTerm = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState<boolean>(false)
  const [submissionState, setSubmissionState] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false)
  const [results, setResults] = useState<(Artist | Release | Master)[]>([])
  const [releaseFilters, setReleaseFilters] = useState<ReleaseNotification[]>([])
  const [labelFilters, setLabelFilters] = useState<LabelNotification[]>([])
  const [artistFilters, setArtistFilters] = useState<ArtistNotification[]>([])
  const [genreFilters, setGenreFilters] = useState<GenreNotification[]>([])
  const [customFilters, setCustomFilters] = useState<CustomNotification[]>([])
  const [allTags, setAllTags] = useState<AllNotifications[]>([])
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })

  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchUser = async () => {
      if (userContext?.user?.data) {
        const data = userContext.user.data
        setUserData(data)
        setArtistFilters(data.artists)
        setReleaseFilters(data.albums)
        setCustomFilters(data.custom)
        setAllTags([...data.albums, ...data.artists, ...data.custom, ...data.genres, ...data.labels])
      }
    }

    fetchUser().catch()
  }, [userContext])

  const handleClickClear = () => {
    console.log('click')
    if (currentTerm.current) {
      currentTerm.current.value = ''
    }
    setSearchTerm('')
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setLoading(true)
    const data = unwrap(await client.getData<SearchResult>(`search/search?q=${e.target.value}`))
    const filteredResults = data.results
    setResults(filteredResults)
    if (data.cursor) {
      setCursor(data.cursor)
    } else {
      setCursor(null)
    }
    setSearchTerm(e.target.value)
    setLoading(false)
  }

  const useRequery = async () => {
    const { data } = await client.getData<SearchResult>(`search/search?q=${searchTerm}&cursor=${cursor}`)
    const filteredResults = data.results.filter((x: (Artist | Release | Master)) => x.type != 'master')
    setResults(prev => [...prev, ...filteredResults])
    if (data.cursor) {
      setCursor(data.cursor)
    } else {
      setCursor(null)
    }
  }

  const debounced = useMemo(() => debounce(onChange, 700), [])

  function removeFromAll<T>(tag: T) {
    setArtistFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setLabelFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setReleaseFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setCustomFilters((prevTags) => prevTags.filter((t) => t !== tag))
    setGenreFilters((prevTags) => prevTags.filter((t) => t !== tag))
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
      case customFilters:
        setCustomFilters(prev =>
          prev.some(t => _.isEqual(t, data))
            ? prev.filter(t => !_.isEqual(t, data))
            : [...prev, data as CustomNotification]
        )
        break
      case genreFilters:
        setGenreFilters(prev =>
          prev.some(t => _.isEqual(t, data))
            ? prev.filter(t => !_.isEqual(t, data))
            : [...prev, data as GenreNotification]
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

  const useSubmitPrefs = async () => {
    setSubmissionState(true)
    const update = Object.assign({}, userData, { artists: artistFilters, labels: labelFilters, albums: releaseFilters, custom: customFilters, genres: genreFilters })
    const result = await updateUser(userContext, client, update)
    if (result === 200) {
      setShow(true)
      setMessage({ title: 'Success', message: 'Filters have been updated!', type: 'success' })
    } else {
      setShow(true)
      setMessage({ title: 'Error', message: 'Something went wrong :(', type: 'error' })
    }
    setSubmissionState(false)
  }

  return (
    <main>
      <div className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full items-center max-w-[116rem] flex flex-col'>
          <div className='mt-4 w-full flex justify-center'>
            <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message} type={message.type} />
          </div>
          <div className={`lg:w-8/10 w-[97%] dark:bg-gray-300 mb-7 dark:text-black rounded-xl border-orange-400 dark:border-indigo-500 border-3 flex flex-col space-y-4 ${show ? 'mt-2' : 'mt-10'} bg-white`}>
            <h1 className='mt-5 text-2xl lg:px-0 md:px-0 px-2 mx-auto text-center'>Set Notification Filters</h1>
            <h3 className='mx-auto w-[98%] px-2 text-center'>Manage filters so you can be notified for what you are looking for!</h3>
            <div className='w-full flex flex-col items-center'>
              <div className='w-[98%] space-y-2 my-3'>
                <h3 className='mb-4 text-center'>
                  Your current Filters:
                </h3>
                <div className='lg:space-x-2 md:space-x-2 space-y-2'>
                  {
                    allTags.map((tag, index) => {
                      if ('album' in tag) {
                        return <Tags
                          className='dark:bg-indigo-300 bg-orange-200 p-1 m-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.album + ' ' + tag.type}
                          onClick={() => handleClick(tag, releaseFilters)}
                        />
                      }
                      if ('artist' in tag) {
                        return <Tags
                          className='dark:bg-green-300 bg-green-200 p-1 m-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.artist}
                          onClick={() => handleClick(tag, artistFilters)}
                        />
                      }
                      if ('label' in tag) {
                        return <Tags
                          className='dark:bg-red-300 bg-red-300 p-1 m-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.label}
                          onClick={() => handleClick(tag, labelFilters)}
                        />
                      }
                      if ('custom' in tag) {
                        console.log('true')
                        return <Tags
                          className='dark:bg-orange-300 bg-indigo-300 p-1 m-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.custom}
                          onClick={() => handleClick(tag, customFilters)}
                        />
                      }
                      if ('genre' in tag) {
                        return <Tags
                          className='dark:bg-yellow-300 bg-yellow-300 p-1 m-1 rounded-2xl shadow-xl'
                          key={index}
                          checked={true}
                          title={tag.genre}
                          onClick={() => handleClick(tag, genreFilters)}
                        />
                      }
                    })
                  }
                </div>
                <div className='w-full flex flex-row'>
                  <div
                    className='w-full border border-slate-500 shadow-sm bg-slate-100 rounded-xl flex flex-row focus-within:ring-2 focus-within:ring-orange-300 focus-within:shadow-[0_0_0.75rem_rgba(255,191,0,0.6)] dark:focus-within:ring-indigo-400 dark:focus-within:shadow-[0_0_0.75rem_rgba(99,102,241,0.7)]'
                  >
                    <input
                      className='text-start py-1 min-h-10 text-black text-base pl-2 w-full bg-transparent outline-none'
                      placeholder='Search for Artists, Releases, Genre, or anything really'
                      type='text'
                      onChange={debounced}
                      ref={currentTerm}
                    />
                    <button onClick={handleClickClear} className='h-9 w-9 m-auto mr-0.5'>
                      <img className='rotate-45 h-6 m-auto w-6' src={plus} alt='Plus' />
                    </button>
                  </div>
                  <button onClick={() => handleClick({ custom: searchTerm ?? '', type: 'custom' }, customFilters)} className='min-h-10 w-20 m-auto ml-1 rounded-xl dark:bg-indigo-400 bg-orange-300'>
                    <img className='h-10 mx-auto' src={plus} alt='Plus' />
                  </button>
                </div>
                <button
                  onClick={() => useSubmitPrefs()}
                  disabled={submissionState}
                  className='w-full bg-orange-300 rounded-xl py-2 text-lg hover:bg-orange-300 dark:bg-indigo-300 dark:hover:bg-indigo-400 disabled:opacity-50
                  disabled:cursor-not-allowed disabled:hover:bg-orange-300 disabled:dark:hover:bg-indigo-300'
                >
                  {submissionState ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {
                loading ? (
                  <div className='w-full justify-center flex space-y-6 my-8 px-4'>
                    <img
                      src={spinLogo}
                      className='max-w-[300px] lg:max-w-[300px] animate-spin1 block dark:hidden'
                      alt='spin-service logo'
                    ></img>
                    <img
                      src={spinLogoDark}
                      className='max-w-[300px] lg:max-w-[300px] animate-spin1 hidden dark:block'
                      alt='spin-service logo'
                    ></img>
                  </div>
                ) : (
                  <>
                    {
                      results.map((x, index) => {
                        if (x.type === 'artist') {
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
                        if((x.type === 'release' || x.type === 'master') && (x.format[0] === 'CD' || x.format[0] === 'Vinyl')) {
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
                    {cursor !== null ?
                      <button
                        className='dark:bg-blue-700 dark:hover:bg-blue-500 bg-orange-500 hover:bg-orange-300 mx-auto mt-3 mb-2 w-[99%] rounded-lg px-1 py-3 text-white' onClick={() => useRequery()}>
                        See More
                      </button>
                      :
                      <></>
                    }
                  </>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const genreList =
  [
    {
      display: 'Blues',
      value: 'blues'
    },
    {
      display: 'Brass & Military',
      value: 'brass military'
    },
    {
      display: 'Children\'s',
      value: 'childrens'
    },
    {
      display: 'Electronic',
      value: 'electronic'
    },
    {
      display: 'Funk / Soul',
      value: 'funk soul'
    },
    {
      display: 'Hip Hop',
      value: 'hip hop'
    },
    {
      display: 'Jazz',
      value: 'jazz'
    },
    {
      display: 'Latin',
      value: 'latin'
    },
    {
      display: 'Non-Music',
      value: 'non music'
    },
    {
      display: 'Pop',
      value: 'pop'
    },
    {
      display: 'Reggae',
      value: 'reggae'
    },
    {
      display: 'Rock',
      value: 'rock'
    },
    {
      display: 'Stage & Screen',
      value: 'stage screen'
    },
  ]