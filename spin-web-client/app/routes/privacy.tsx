import type { Route } from './+types/home'
import React from 'react'
import Navbar from '~/components/Navbar'
import ButtonMailto from '~/components/ButtonMailto'
import { useNavigate } from 'react-router'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'tos | spin-service' }
  ]
}

export default function User() {

  const navigate = useNavigate()

  return (
    <main
      className='flex flex-col dark:text-white font-primary text-black items-center bg-gradient-to-b from-orange-200 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <Navbar/>
      <div className='w-full max-w-3xl flex flex-col justify-center mx-auto px-4'>
        <h1 className='mt-10 text-3xl text-center font-semibold'>
          Privacy Policy
        </h1>

        <p className='mt-8 text-base leading-relaxed'>
          Spin My Records (“SPIN”) respects your privacy. This policy explains
          what information we collect, how it is used, and your choices.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>1. Information We Collect</h2>
        <p className='mt-2 text-base leading-relaxed'>
          We collect only the information necessary to provide our service,
          which may include your email address, phone number, and account
          preferences.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>2. How We Use Information</h2>
        <p className='mt-2 text-base leading-relaxed'>
          Your email address and phone number are used solely to send
          notifications you have explicitly opted into, such as back-in-stock or
          availability alerts for vinyl records you track.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>3. No Sale of Data</h2>
        <p className='mt-2 text-base leading-relaxed'>
          We do not sell, rent, or trade your personal information to third
          parties. Your contact information is never used for advertising or
          marketing purposes outside of Spin My Records.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>4. SMS Communications</h2>
        <p className='mt-2 text-base leading-relaxed'>
          SMS notifications are optional and require explicit opt-in. Message
          and data rates may apply. You may opt out at any time by replying STOP
          or by disabling SMS notifications in your account settings.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>5. Data Security</h2>
        <p className='mt-2 text-base leading-relaxed'>
          All the above categories exclude text messaging originator opt-in data and consent; this information won’t be shared with any third parties.
        </p>

        <h2 className='mt-8 text-xl font-semibold'>6. Changes to This Policy</h2>
        <p className='mt-2 text-base leading-relaxed'>
          This Privacy Policy may be updated from time to time. Changes will be
          posted on this page.
        </p>

        <p className='mt-10 text-base mb-10 text-center'>
          Questions or concerns?{' '}
          <a
            href='mailto:actuallychowmein@gmail.com'
            className='underline text-orange-600 dark:text-indigo-300'
          >
            Contact us by email
          </a>
        </p>
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