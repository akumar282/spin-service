import type { Route } from './+types/home'
import React from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import ButtonMailto from '~/components/ButtonMailto'
import Footer from '~/components/Footer'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'help | spin-service' }
  ]
}

export default function User() {

  return (
      <main className='flex flex-col font-primary  items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='dark:text-white text-black w-full flex flex-col justify-center mx-auto'>
          <p className='mt-10 text-xl mx-2 text-center'>
            If you need help or have any question concerns or comments&nbsp;
            <ButtonMailto label='send an email here!' mailto='mailto:actuallychowmein@gmail.com'/>
            <p className='pt-5'>
              actuallychowmein@gmail.com
            </p>
          </p>
          <p className='mt-10 text-xl mx-2 text-center'>
            Feature requests and feedback is more than welcome!
          </p>
        </div>
        <Footer/>
      </main>
  )
}