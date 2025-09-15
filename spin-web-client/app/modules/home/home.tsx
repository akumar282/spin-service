import { Card } from '~/components/Card'
import vinyl from './vinyl.svg'
import alarm from './alarm.svg'
import settings from './settings.svg'
import HomeNavbar from '~/components/HomeNavbar'
import { useNavigate } from 'react-router'
import React from 'react'

export function Home() {

  const navigate = useNavigate()

  return (
    <main className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <HomeNavbar />
      <div className='items-center justify-center max-w-[1500px] text-lg w-10/12 mt-10 grid gap-5 grid-cols-1 lg:grid-cols-3'>
        <button className='group rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300' onClick={() => navigate('/manage/notifications')}>
          <h1 className='text-start w-8/12 mt-8 mr-6'>Manage Notifications</h1>
          <div className='mx-auto'>
            <img className='absolute inline-flex group-hover:animate-ping1 opacity-75' height={60} width={60} src={alarm} />
            <img className='relative inline-flex' height={60} width={60} src={alarm} />
          </div>
        </button>
        <button className='group rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300' onClick={() => navigate('/browse')}>
          <h1 className='text-start w-8/12 mt-8 mr-6'>Browse Latest Releases</h1>
          <div className='mx-auto'>
            <img className='group-hover:animate-spin1' height={60} width={60} src={vinyl} />
          </div>
        </button>
        <button className='group rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 dark:border-indigo-600 border-3 px-3 py-3 bg-white dark:bg-slate-300 hover:bg-orange-100 dark:hover:bg-indigo-300' onClick={() => navigate('/manage/user')}>
          <h1 className='text-start w-8/12 mt-8'>Manage User Information</h1>
          <div className='mx-auto pl-8'>
            <img className='group-hover:animate-spin1' height={60} width={60} src={settings} />
          </div>
        </button>
      </div>
      {/*<h1>*/}
      {/*  Recent Releases*/}
      {/*</h1>*/}
      {/*<div className="items-center justify-center max-w-[1500px] w-10/12 mt-4 grid gap-5 grid-cols-1 lg:grid-cols-4 md:grid-cols-2">*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*</div>*/}
    </main>
  )
}