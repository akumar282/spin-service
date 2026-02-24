import spinLogo from '~/assets/spinLogo.png'
import spinLogoDark from '~/assets/spinLogoDark.png'
import React from 'react'
import { useNavigate } from 'react-router'

export default function Footer() {

  const navigate = useNavigate()
  
  return (
    <footer
      className='relative w-full mt-auto flex flex-col items-center text-white dark:bg-indigo-500 bg-orange-300 pb-4'>
      <h3 className='mt-3 text-sm inline-flex items-center gap-1'>
        Made with
        <img
          src={spinLogo}
          className='h-6 w-6 mx-1 inline dark:hidden'
          alt='spin-service logo'
        />
        <img
          src={spinLogoDark}
          className='h-6 w-6 mx-1 hidden dark:inline'
          alt='spin-service logo'
        />
        in Seattle
      </h3>

      <button
        className='absolute right-4 top-3'
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
  )
}