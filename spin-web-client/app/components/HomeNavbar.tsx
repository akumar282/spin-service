import { useNavigate } from 'react-router'
import logout from '~/assets/logout.svg'
import React from 'react'
import { useTriggerOut } from '~/functions'

export default function HomeNavbar() {

  const navigate = useNavigate()
  const triggerOut = useTriggerOut()

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
      <button onClick={triggerOut}>
        <img height={30} width={30} src={logout} alt={'logout image'}/>
      </button>
    </nav>
  )
}