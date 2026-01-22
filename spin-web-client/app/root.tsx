import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useNavigate,
} from 'react-router'
import React from 'react'

import type { Route } from './+types/root'
import './app.css'
import shrug from '~/assets/shrug.png'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='bg-orange-100 h-dvh dark:bg-slate-900'>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  const navigate = useNavigate()

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? '404 | I don\'t have that in the back'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='pt-16 p-4 flex text-wrap bg-gray-800 h-full w-full'>
      <div className='mx-auto items-center overflow-hidden flex flex-col'>
        <h1 className='text-2xl font-primary'>{details}</h1>
        <img src={shrug} className='lg:w-[50rem] lg:h-[50rem] md:w-72 h-72 w-40 h-40' alt={'shrug man'}/>
        {stack && (
          <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
        )}
        <h1 className='font-primary text-center text-xl text-wrap pt-5'>Back to
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
