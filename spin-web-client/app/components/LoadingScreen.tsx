import React from 'react'
import spinLogo from '~/modules/welcome/spinLogo.png'
import spinLogoDark from '~/modules/welcome/spinLogoDark.png'

export default function LoadingScreen() {
  return (
    <div className='bg-primary-purple flex flex-col h-screen w-screen items-center justify-center'>
      <div className='flex flex-col items-center'>
        <h1
          className='font-primary text-3xl text-center relative w-[max-content] before:absolute before:inset-0 before:animate-message1
          before:bg-primary-purple after:absolute after:inset-0 after:w-[0.125em] after:animate-carat after:bg-black'>
          Striking your matches
        </h1>
      </div>
      <img
        src={spinLogo}
        className='animate-spin1 block dark:hidden'
        alt='spin-service logo'
      ></img>
      <img
        src={spinLogoDark}
        className='animate-spin1 hidden dark:block'
        alt='spin-service logo'
      ></img>
    </div>
  )
}