import React from 'react'
import spinLogo from 'app/assets/spinLogo.png'
import spinLogoDark from 'app/assets/spinLogoDark.png'
import Typewriter from 'typewriter-effect'


export default function LoadingScreen() {
  return (
    <main className='font-primary flex flex-col justify-center items-center bg-orange-100 min-h-dvh w-full flex dark:bg-slate-900'>
      <div className='bg-primary-purple max-w-[300px] lg:max-w-[300px] w-full space-y-6 my-8 px-4'>
        <div className='flex flex-col items-center'>
          <h1
            className='font-primary text-3xl text-center relative w-[max-content]'>
            <Typewriter
              onInit={(typewriter) => {
                typewriter.typeString('Turning the tables...')
                  .start()
              }}
            />
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
    </main>

  )
}