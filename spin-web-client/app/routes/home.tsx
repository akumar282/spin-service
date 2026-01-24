import type { Route } from './+types/landing'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Records, RecordsResult, Upcoming, UpcomingResult } from '~/types'
import { SpinClient } from '~/api/client'
import HomeNavbar from '~/components/HomeNavbar'
import alarm from '~/assets/alarm.svg'
import vinyl from '~/assets/vinyl.svg'
import settings from '~/assets/settings.svg'
import ReleaseCard from '~/components/ReleaseCard'
import { SeeMore, SeeMoreSmall } from '~/components/SeeMore'
import UpcomingCard from '~/components/UpcomingCard'
import { AuthContext } from '~/components/AuthContext'
import CardLoader from '~/components/CardLoader'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'home | spin-service' },
    { name: 'spin-service home page', content: 'set your preferences and look up recent releases or upcoming albums' },
  ]
}

export default function Landing() {

  const navigate = useNavigate()
  const context = useContext(AuthContext)

  const [data, setData] = useState<Records[] | null>(null)
  const [upcoming, setUpcoming] = useState<Upcoming[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const client = new SpinClient()

  useEffect(() => {
    const getReleases = async () => {
      const data = await client.getData<RecordsResult>('public?count=10')
      setData(data.data.items)

      const soon = await client.getData<UpcomingResult>('public/upcoming?count=10')
      setUpcoming(soon.data.items)
    }

    getReleases().finally(() => setLoading(false)).catch()
  }, [])

  return (
    <main
      className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <HomeNavbar/>
      <div className='max-w-[1500px] w-11/12 mt-10 dark:text-white text-2xl'>
        <h1>
          Welcome!
        </h1>
      </div>
      <div
        className='items-center justify-center max-w-[1500px] text-lg w-11/12 mt-3 grid gap-5 grid-cols-1 lg:grid-cols-3 md:grid-cols-3'>
        <button
          className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
          onClick={() => navigate('/browse')}>
          <h1 className='text-start w-8/12 mt-8 mr-6'>Browse Latest Releases</h1>
          <div className='mx-auto h-15 w-15'>
            <img className='group-hover:animate-spin1' src={vinyl}/>
          </div>
        </button>
        {
          context?.user !== null ? (
            <>
              <button
                className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
                onClick={() => navigate('/manage/notifications')}>
                <h1 className='text-start w-8/12 mt-8 mr-6'>Manage Notifications</h1>
                <div className='relative mx-auto h-15 w-15'>
                  <img
                    className='absolute inset-0 animate-none group-hover:animate-ping1 opacity-75'
                    src={alarm}
                  />
                  <img className='relative inset-0' src={alarm}/>
                </div>
              </button>
              <button
                className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
                onClick={() => navigate('/manage/user')}>
                <h1 className='text-start w-8/12 mt-8'>Manage User Information</h1>
                <div className='mx-auto pl-8 '>
                  <img className='group-hover:animate-spin1' height={60} width={60} src={settings}/>
                </div>
              </button>
            </>
          ) : (
            <></>
          )
        }
      </div>
      <div className='max-w-[1500px] w-11/12 mt-6 space-y-2 dark:text-white'>
        <h1 className='text-2xl'>
          Recent Releases
        </h1>
        <h3 className='text-md'>
          Releases, Restocks, Represses that have happened in the past 24 hours
        </h3>
      </div>
      <div className='items-center max-w-[1500px] w-11/12 mt-2'>
        <div className='overflow-x-auto rounded-2xl'>
          <div className='flex gap-4 mt-1 pb-2 px-1.5'>
            {
              loading ? (
                <CardLoader/>
              ) : (
                <>
                  {
                    data?.map((x, index) => {
                      return <ReleaseCard tag={x.releaseType} preOrder={x.preorder} upcoming={false} key={index}
                                          artist={x.artist!} title={x.album} linkTo={x.thumbnail!} data={x}/>
                    })
                  }
                  <SeeMore/>
                </>
              )
            }
          </div>
        </div>
      </div>
      <div className='max-w-[1500px] w-11/12 mt-6 space-y-2 dark:text-white'>
        <h1 className='text-2xl'>
          Upcoming Albums
        </h1>
        <h3 className='text-md'>
          Albums that have potential drops upon release
        </h3>
      </div>
      <div className='items-center max-w-[1500px] w-11/12 mt-2'>
        <div className='overflow-x-auto rounded-2xl'>
          <div className='flex gap-4 mt-1 pb-2 px-1.5'>
            {
              loading ? (
                <CardLoader/>
              ) : (
                <>
                  {
                    upcoming?.map((x, index) => {
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
                  <SeeMoreSmall/>
                </>
              )
            }
          </div>
        </div>
      </div>
      <footer
        className='relative w-full mt-auto flex flex-col items-center text-white dark:bg-indigo-500 bg-orange-300 pb-5'>
        <h3 className='mt-4 text-sm text-center'>
          Made with 🧡 in Seattle
        </h3>

        <button
          className='absolute right-4 top-4'
          onClick={() => navigate('/help')}
          aria-label='Help'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0
           1.172 1.025 1.172 2.687 0 3.712
           -.203.179-.43.326-.67.442
           -.745.361-1.45.999-1.45 1.827v.75
           M21 12a9 9 0 1 1-18 0
           9 9 0 0 1 18 0
           Zm-9 5.25h.008v.008H12v-.008Z'
            />
          </svg>
        </button>
      </footer>
    </main>
  )
}
