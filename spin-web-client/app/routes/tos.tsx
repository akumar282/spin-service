import type { Route } from './+types/home'
import React from 'react'
import Navbar from '~/components/Navbar'
import ButtonMailto from '~/components/ButtonMailto'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'tos | spin-service' }
  ]
}

export default function User() {

  return (
    <main className='flex flex-col dark:text-white font-primary text-black items-center bg-gradient-to-b from-orange-200 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <Navbar/>
      <div className='w-full flex flex-col justify-center mx-auto'>
        <p className='mt-10 text-3xl mx-2 text-center'>
          Terms of Service
        </p>
        <p className='mt-10 text-xl mx-2 text-center'>
          1. uhhhh be a good person
        </p>
        <p className='mt-10 text-xl mx-2 text-center'>
          2. have fun (optional)
        </p>
        <p className='mt-10 text-xl mx-2 text-center'>
          Questions? <ButtonMailto label='Send an email here!' mailto='mailto:actuallychowmein@gmail.com'/>
        </p>
      </div>
    </main>
  )
}