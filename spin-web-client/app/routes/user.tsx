import type { Route } from './+types/home'
import React from 'react'
import HomeNavbar from '~/components/HomeNavbar'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function User() {
  return (
    <main>
      <div
        className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full h-full lg:my-auto md:my-auto mt-10 items-center'>
          <div
            className='flex lg:w-6/12 w-10/12 mx-auto bg-white/75 items-center flex-col border border-orange-400 rounded-2xl'>
            <h1 className='text-xl m-3'>
              User Information
            </h1>
            <div className='items-start w-10/12 space-y-4 m-5'>
              <div className='flex space-y-2 flex-col-reverse'>
                <input className='bg-white my-2 text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2' type='text'/>
                <h3>
                  Email Address
                </h3>
              </div>
              <div className='flex space-y-2 flex-col-reverse'>
                <input className='bg-white my-2 text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2' type='text'/>
                <h3>
                  Phone
                </h3>
              </div>
            </div>
            <button className='bg-orange-300 rounded-2xl py-3 text-lg px-4 m-4'>
              Update
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}