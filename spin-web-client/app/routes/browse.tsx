import React, { type ChangeEventHandler, useEffect, useState } from 'react'
import type { Route } from '../+types/root'
import HomeNavbar from '~/components/HomeNavbar'
import debounce from 'lodash/debounce'
import type { Records, RecordsResult } from '~/types'
import { Card } from '~/components/Card'
import { SpinClient } from '~/api/client'


export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Browse() {

  const [highlighted, setHighlighted] = useState<Records[]>([])
  const [data, setData] = useState<Records[]>([])
  const [cursor, setCursor] = useState<string | null>(null)

  const client = new SpinClient()

  useEffect(() => {
    const getReleases = async () => {
      const data = await client.getData<RecordsResult>('public?count=20')
      setData(data.items)
      setHighlighted(data.items)
      setCursor(data.cursor)
    }

    getReleases().catch()
  }, [])

  const useRequery = async () => {
    const newData = await client.getData<RecordsResult>(`public?count=20&cursor=${cursor}`)
    setCursor(newData.cursor)
    setData([...data, ...newData.items])
    setHighlighted([...highlighted, ...newData.items])
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    console.log(e.target.value)
    if (data !== null) {
      const search = data.filter((record) => record.postTitle.toLowerCase().includes(e.target.value.toLowerCase()))
      setHighlighted(search)
    }
  }

  const debounced = debounce(onChange, 500)

  return (
    <main
      className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <HomeNavbar/>
      <div className='max-w-[1500px] space-y-2 flex flex-col w-11/12 mt-10 mb-10 dark:text-white'>
        <h1 className='text-2xl'>
          Latest Releases
        </h1>
        <h3>
          Items here have released in the past 24 hours
        </h3>
        <div className='mt-1 mb-4'>
          <input
            className='text-start py-1 bg-slate-100 text-black text-base mt-3 rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-600 w-full'
            placeholder='Search for recent releases'
            type='text'
            onChange={debounced}
          />
        </div>
        <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] items-center'>
          {
            highlighted?.map((x, index) => {
              return <Card image={x.thumbnail} key={index} artist={x.artist!} title={x.title} color={x.color!} genre={x.genre} storeLink={x.link}/>
            })
          }
        </div>
        {cursor !== null ?
          <button className='bg-blue-700 mx-auto mt-6 lg:w-2/12 w-[97%] rounded-lg px-2 py-2 text-white' onClick={() => useRequery()}>
            See More
          </button>
          :
          <></>
        }
      </div>
    </main>
  )
}
