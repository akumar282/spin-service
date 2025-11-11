import { Card } from '~/components/Card'
import vinyl from './vinyl.svg'
import alarm from './alarm.svg'
import settings from './settings.svg'
import HomeNavbar from '~/components/HomeNavbar'
import { useNavigate } from 'react-router'
import React, { useEffect, useState } from 'react'
import ReleaseCard from '~/components/ReleaseCard'
import type { Records, RecordsResult } from '~/types'
import { SpinClient } from '~/api/client'
import SeeMore from '~/components/SeeMore'

export function Home() {

  const navigate = useNavigate()

  const [data, setData] = useState<Records[] | null>(null)

  const client = new SpinClient()

  useEffect(() => {
    const getReleases = async () => {
      const data = await client.getData<RecordsResult>('public?count=10')
      setData(data.data.items)
    }

    getReleases().catch()
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
        className='items-center justify-center max-w-[1500px] text-lg w-11/12 mt-3 grid gap-5 grid-cols-1 lg:grid-cols-3'>
        <button
          className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
          onClick={() => navigate('/manage/notifications')}>
          <h1 className='text-start w-8/12 mt-8 mr-6'>Manage Notifications</h1>
          <div className='mx-auto'>
            <img className='absolute inline-flex group-hover:animate-ping1 opacity-75' height={60} width={60}
                 src={alarm}/>
            <img className='relative inline-flex' height={60} width={60} src={alarm}/>
          </div>
        </button>
        <button
          className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
          onClick={() => navigate('/browse')}>
          <h1 className='text-start w-8/12 mt-8 mr-6'>Browse Latest Releases</h1>
          <div className='mx-auto'>
            <img className='group-hover:animate-spin1' height={60} width={60} src={vinyl}/>
          </div>
        </button>
        <button
          className='group rounded-2xl flex flex-row shrink-0 transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300'
          onClick={() => navigate('/manage/user')}>
          <h1 className='text-start w-8/12 mt-8'>Manage User Information</h1>
          <div className='mx-auto pl-8'>
            <img className='group-hover:animate-spin1' height={60} width={60} src={settings}/>
          </div>
        </button>
      </div>
      <div className='max-w-[1500px] w-11/12 mt-6 dark:text-white text-2xl'>
        <h1>
          Recent Releases
        </h1>
      </div>
      <div className='items-center max-w-[1500px] w-11/12 mt-2'>
        <div className='overflow-x-auto rounded-2xl'>
          <div className='flex gap-4 mt-1 pb-2 px-1.5'>
            {
              data?.map((x, index) => {
                return <ReleaseCard preOrder upcoming={false} key={index} artist={x.artist!} title={x.title} linkTo={x.thumbnail!}/>
              })
            }
            <SeeMore/>
          </div>
        </div>
      </div>
    </main>
  )
}