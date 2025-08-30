import React from 'react'
import HomeNavbar from '~/components/HomeNavbar'

export function ChannelsComponent() {
  return (
    <main>
      <div className='flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full h-full lg:my-auto md:my-auto mt-20 items-center'>
          <div
            className='flex lg:w-6/12 w-10/12 mx-auto bg-white/75 items-center flex-col border border-orange-400 rounded-2xl'>
            <h1 className='text-xl m-3'>
              Notification Methods
            </h1>
            <div className='items-start space-y-5 m-5'>
              <div className='flex space-x-3 flex-row'>
                <input className='h-6 w-6' type='checkbox'/>
                <h3>
                  Text/SMS
                </h3>
              </div>
              <div className='flex space-x-3 flex-row'>
                <input className='h-6 w-6' type='checkbox'/>
                <h3>
                  Email
                </h3>
              </div>
              <div className='flex space-x-3 flex-row'>
                <input className='h-6 w-6' type='checkbox'/>
                <h3>
                  Push Notifications (App Required)
                </h3>
              </div>
            </div>
            <button className='bg-orange-300 rounded-2xl py-3 text-lg px-4 m-4'>
              Submit
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}