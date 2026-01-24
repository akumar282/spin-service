import type { Route } from './+types/home'
import React from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import ButtonMailto from '~/components/ButtonMailto'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'help | spin-service' }
  ]
}

export default function User() {

  return (
      <main className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='text-white w-full flex flex-col justify-center mx-auto'>
          <p className='mt-10 text-xl mx-2 text-center'>
            If you need help or have any question concerns or comments email <ButtonMailto label='send an email here!'
                                                                              mailto='mailto:actuallychowmein@gmail.com'/>
          </p>
          <p className='mt-10 text-xl mx-2 text-center'>
            Feature requests and feedback is more than welcome!
          </p>
        </div>
      </main>
  )
}