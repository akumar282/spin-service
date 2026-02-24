import type { Route } from './+types/home'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import Navbar from '~/components/Navbar'
import SignUpForm from '~/components/SignUpForm'
import Alert from '~/components/Alert'
import Footer from '~/components/Footer'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'login | spin-service' },
    { name: 'login page', content: 'login page' },
  ]
}

export default function Login() {

  const navigate = useNavigate()

  const [show, setShow] = useState<boolean>(false)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })

  return (
    <main className='min-h-screen font-primary flex-col bg-orange-100 w-full flex dark:bg-slate-900'>
      <div>
        <Navbar />
        <div className='flex-1 flex flex-col items-center text-center lg:flex-col'>
          <div className='mt-4 w-full flex justify-center'>
            <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message}
                   type={message.type}/>
          </div>
          <div className='mt-8 space-y-4 justify-center'>
            <div className='pt-10 flex flex-col items-center justify-center'>
              <h1 className='text-center font-secondary text-4xl mb-2 font-light'>Welcome Back!</h1>
              {/*<OAuthButtons onClick={() => console.log('hello')}*/}
              {/*              label='Login with Google' src={google} />*/}
            </div>
            {/*<div className='py-2 flex items-center justify-center'>*/}
            {/*  <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line' />*/}
            {/*  <h1 className='px-4 font-primary text-lg'>or</h1>*/}
            {/*  <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line' />*/}
            {/*</div>*/}
            <SignUpForm flow={'login'} setShow={setShow} setMessage={setMessage}/>
            <h1 className='font-primary text-center pt-5'>Don&#39;t have an account?
              <button
                type='button'
                onClick={() => navigate('/signup')}
                className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>Sign Up
              </button>
            </h1>
          </div>
        </div>
      </div>
      <Footer/>
    </main>
  )
}
