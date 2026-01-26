import type { Route } from './+types/home'
import React, { useState } from 'react'
import Navbar from '~/components/Navbar'
import SignUpForm from '~/components/SignUpForm'
import Alert from '~/components/Alert'
import { useNavigate } from 'react-router'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'signup | spin-service' },
    { name: 'spin service sign up', content: 'sign up now!!!' },
  ]
}

export default function SignUpPage() {

  const navigate = useNavigate()

  const [show, setShow] = useState<boolean>(false)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })

  return (
    <main>
      <div className='font-primary flex flex-col bg-orange-100 h-dvh w-full flex dark:bg-slate-900'>
        <Navbar/>
        <div className='flex-1 flex flex-col items-center text-center lg:flex-col'>
          <div className='mt-4 w-full flex justify-center'>
            <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message}
                   type={message.type}/>
          </div>
          <div className='mt-4 space-y-4 justify-center'>
            <div className='pt-10 flex flex-col items-center justify-center'>
              <h1 className='text-center font-secondary text-4xl font-light'>Get Started</h1>
              <h2 className='text-center text-lg text-medium font-primary pt-4'>Create an account</h2>
              {/*<OAuthButtons onClick={() => console.log('hello')}*/}
              {/*              label='Sign up with Google' src={google}/>*/}
            </div>
            {/*<div className='py-4 flex items-center justify-center'>*/}
            {/*  <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line'/>*/}
            {/*  <h1 className='px-4 font-primary text-lg'>or</h1>*/}
            {/*  <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line'/>*/}
            {/*</div>*/}
            <SignUpForm flow={'new_user'} setMessage={setMessage} setShow={setShow}/>
            <h1 className='font-primary text-center pt-5'>Already have an account?
              <button
                type='button'
                onClick={() => navigate({ pathname: '/login' })}
                className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>Log In
              </button>
            </h1>
          </div>
        </div>
      </div>
    </main>
  )
}