import type { Route } from './+types/home'
import React from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import {ResultComponent} from '~/components/ResultComponent'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Filters() {
  return (
    <main>
      <div className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full items-center flex flex-col'>
          <div className='lg:w-8/10 w-11/12 rounded-xl border border-orange-400 border-3 flex flex-col space-y-4 mt-10 bg-white'>
            <h1 className='mt-5 text-2xl mx-auto'>Set Notification Filters</h1>
            <h3 className='mx-auto'>Manage filters so you can be notified for what you are looking for and what you want</h3>
            <div className='w-full flex flex-col items-center'>
              <div className='w-9/10 space-y-2 my-3'>
                <h3 className='mb-4'>
                  Your current Filters:
                </h3>
                <input type='text' placeholder='Search for Artists, Releases, or Labels'
                       className='text-start py-1 bg-slate-100 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 w-full'/>
              </div>
              <ResultComponent/>
              <ResultComponent/>
            </div>
          </div>
        </div>
      </div>
      Hello
    </main>
  )
}