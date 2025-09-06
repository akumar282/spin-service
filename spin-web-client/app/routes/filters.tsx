import type { Route } from './+types/home'
import React, { type ChangeEventHandler, useState } from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import {ArtistResultComponent, ResultComponent} from '~/components/ResultComponent'
import debounce from 'lodash/debounce'
import type {Artist, Master, Release, ReleaseNotification} from '~/types'


export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Filters() {

  const returnEndpoint = (term: string) => {
    return `https://jl8iq2i3k8.execute-api.us-west-2.amazonaws.com/prod/search/search?q=${term}`
  }

  const [results, setResults] = useState<(Artist | Release | Master)[]>([])
  const [releaseFilters, setReleaseFilters] = useState<ReleaseNotification[]>([])
  const [labelFilters, setLabelFilters] = useState<string[]>([])
  const [artistFilters, setArtistFilters] = useState<string[]>([])
  const [allView, setAllView] = useState<(string | ReleaseNotification)[]>([])

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const data = await fetch(returnEndpoint(e.target.value))
    const dataJson = await data.json()
    const filteredResults = dataJson.results.filter((x: (Artist | Release | Master)) => x.type != 'master')
    setResults(filteredResults)
  }

  const debounced = debounce(onChange, 700)

  return (
    <main>
      <div className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full items-center max-w-[116rem] flex flex-col'>
          <div className='lg:w-8/10 w-[97%] dark:bg-gray-300 dark:text-black rounded-xl border border-orange-400 dark:border-indigo-500 border-3 flex flex-col space-y-4 mt-10 bg-white'>
            <h1 className='mt-5 text-2xl mx-auto'>Set Notification Filters</h1>
            <h3 className='mx-auto w-[98%] px-2 text-center'>Manage filters so you can be notified for what you are looking for and what you want</h3>
            <div className='w-full flex flex-col items-center'>
              <div className='w-9/10 space-y-2 my-3'>
                <h3 className='mb-4'>
                  Your current Filters:
                </h3>
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
                    return <ArtistResultComponent key={index} _typename={x.type} title={x.title} subtitle={x.title} thumbnail={x.thumb} data={x}/>
                  }
                  if(x.type === 'release' && x.country === 'US') {
                    return <ResultComponent key={index} _typename={x.type} title={x.title} subtitle={x.title} thumbnail={x.thumb} data={x} year={x.year} format={x.format} linkTo={x.uri}/>
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