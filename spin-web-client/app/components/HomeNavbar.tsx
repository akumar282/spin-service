import { useNavigate } from 'react-router'
import React from 'react'
import WhichButton from '~/components/WhichButton'

export default function HomeNavbar() {

  const navigate = useNavigate()

  return (
    <nav
      className='relative px-4 py-4 w-full flex justify-between items-center bg-white/75 shadow-lg shadow-gray-300/50 '>
      <button onClick={() => navigate('/home')}>
        <h1 className='font-primary text-2xl'>
          spin-service
          <sub className='text-sm'>
            beta
          </sub>
        </h1>
      </button>
      <WhichButton/>
    </nav>
  )
}