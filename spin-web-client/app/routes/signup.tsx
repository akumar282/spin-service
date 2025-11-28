import type { Route } from './+types/home'
import React from 'react'
import Navbar from '~/components/Navbar'
import OAuthButtons from '~/components/OAuthButton'
import google from '~/assets/google.svg'
import orline from '~/assets/orline.png'
import SignUpForm from '~/components/SignUpForm'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'spin-service' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function SignUpPage() {

  return (
    <main>
      <div className='font-primary flex flex-col bg-orange-100 h-dvh w-full flex dark:bg-slate-900'>
        <Navbar/>
        <div className='flex-1 flex flex-col items-center text-center lg:flex-col'>
          <div className='mt-4 space-y-4 justify-center'>
            <div className='pt-10 flex flex-col items-center justify-center'>
              <h1 className='text-center font-secondary text-4xl font-light'>Get Started</h1>
              <h2 className='text-center text-lg text-medium font-primary pt-4'>Create an account</h2>
              <OAuthButtons onClick={() => console.log('hello')}
                            label='Sign up with Google' src={google}/>
            </div>
            <div className='py-4 flex items-center justify-center'>
              <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line'/>
              <h1 className='px-4 font-primary text-lg'>or</h1>
              <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line'/>
            </div>
            <SignUpForm/>
          </div>
        </div>
      </div>
    </main>
  )
}