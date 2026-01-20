import React, { useEffect, useState } from 'react'
import type { Route } from '../+types/root'
import HomeNavbar from '~/components/HomeNavbar'
import type { Upcoming, UpcomingResult } from '~/types'
import { SpinClient } from '~/api/client'
import spinLogo from '~/assets/spinLogo.png'
import spinLogoDark from '~/assets/spinLogoDark.png'
import UpcomingCard from '~/components/UpcomingCard'


export function meta({}: Route.MetaArgs) {
  return [
    { title: 'upcoming | spin-service' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Browse() {

  const [loading, setLoading] = useState<boolean>(true)
  const [results, setResults] = useState<Upcoming[]>([])
  const [cursor, setCursor] = useState<string | null>(null)

  const client = new SpinClient()

  useEffect(() => {
    const getReleases = async () => {
      const { data } = await client.getData<UpcomingResult>('public/upcoming?count=10')
      setResults(data.items)
      setCursor(data.cursor)
    }

    getReleases().finally(() => setLoading(false)).catch()
  }, [])

  const useRequery = async () => {
    const { data } = await client.getData<UpcomingResult>(`public/upcoming?count=20&cursor=${cursor}`)
    setCursor(data.cursor)
    setResults([...results ,...data.items])
  }

  return (
    <main
      className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <HomeNavbar/>
      <div className='max-w-[1500px] space-y-2 flex flex-col w-11/12 mt-10 mb-10 dark:text-white'>
        <h1 className='text-2xl'>
          Upcoming Releases
        </h1>
        <h3>
          Releases that have confirmed and rumored release dates
        </h3>
        <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] items-center'>
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
                  results?.map((x, index) => {
                    return <UpcomingCard
                      date={x.date}
                      key={index}
                      artist={x.artist}
                      title={x.album}
                      data={x}
                      upcoming={true}
                    />
                  })
                }
              </>
            )
          }
        </div>
        {cursor !== null ?
          <button
            className='dark:bg-blue-700 bg-orange-500 mx-auto mt-6 w-[97%] lg:w-full md:w-full rounded-lg px-2 py-3 text-white' onClick={() => useRequery()}>
            See More
          </button>
          :
          <></>
        }
      </div>
    </main>
  )
}
