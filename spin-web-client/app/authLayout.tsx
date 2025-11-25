import {
  Outlet, useNavigate,
} from 'react-router'
import React, { useContext } from 'react'
import noentry from './assets/noentry.png'
import type { Route } from './+types/root'
import './app.css'
import { AuthContext } from '~/components/AuthContext'

export default function AuthLayout() {
  const context = useContext(AuthContext)

  if (!context) {
    console.log('no notext')
    return
  }

  const { user } = context

  if (user === null || user === undefined) {
    throw new Response('Unauthorized', {
      status: 401,
      statusText: 'You must log in.'
    })
  } else {
    console.log('context:', user)
    return (
      <Outlet />
    )
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let details = 'You\'re not supposed to be here'
  let stack: string | undefined

  const navigate = useNavigate()
  if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='pt-16 p-4 flex bg-gray-800 h-full w-full'>
      <div className='mx-auto items-center flex flex-col'>
        <h1 className='text-2xl font-primary'>{details}</h1>
        <img src={noentry} alt={'angry man'}/>
        {stack && (
          <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
        )}
        <h1 className='font-primary text-center text-xl pt-5'>Back to
          <button
            type='button'
            onClick={() => navigate('/home')}
            className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>home
          </button>
        </h1>
      </div>
    </main>
  )
}
