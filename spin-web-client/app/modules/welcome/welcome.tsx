import spinLogo from './spinLogo.png'
import spinLogoDark from './spinLogoDark.png'
import { useNavigate } from 'react-router'

export function Welcome() {

  const navigate = useNavigate()

  return (
    <main className='font-primary bg-orange-100 min-h-dvh w-full flex dark:bg-slate-900'>
      <div className='flex-1 flex flex-col items-center'>
        <div className='max-w-[300px] lg:max-w-[300px] w-full space-y-6 my-8 px-4'>
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
        <div className='max-w-[300px] lg:max-w-[300px] w-full mb-6 px-4'>
          <h1 className='text-4xl text-center'>spin-service</h1>
        </div>
        <div className='md:w-8/12 w-10/12 max-w-[2000px] rounded-3xl lg:mb-0 mb-8 shadow-xl'>
          <div className='rounded-3xl border dark:border-indigo-900 flex flex-col items-center border-orange-200 border-4 p-6 dark:border-gray-700 space-y-4'>
            <h1 className='leading-6 text-2xl text-gray-700 dark:text-gray-200 text-center'>
              Welcome!
            </h1>
            <h3 className='leading-6 text-gray-700 pt-4 dark:text-gray-200 text-center'>
              Tired of missing out on exclusive releases for vinyl and CDs? Use
              spin-service!
            </h3>
            <h3 className='leading-6 text-gray-700 pt-2 dark:text-gray-200 text-center'>
              Get notified for vinyl and cd releases when they happen!
            </h3>
            <h3 className='leading-6 text-gray-700 pt-2 dark:text-gray-200 text-center'>
              Completely free! Set alerts for any artist, album, genre, and even
              label!
            </h3>
            <h3 className='leading-6 text-gray-700 pt-2 dark:text-gray-200 text-center'>
              Alerts are sent through a method of your choosing. Email, Text, or
              Push notification (app required)!
            </h3>
            <button
              className='shadow-xl my-5 bg-orange-300 dark:bg-indigo-400 p-3 rounded-xl transition ease-in-out hover:-translate-y-3 hover:scale-110 hover:bg-orange-400 dark:hover:bg-indigo-800'
              onClick={() => navigate({ pathname: '/signup' })}
            >
              Get Started
            </button>
          </div>
        </div>
        <footer className='w-full mt-auto flex flex-col items-center dark:bg-indigo-500 bg-orange-300 pb-5'>
          <h3 className='mt-4 text-sm'>Made with 🧡 in Seattle</h3>
        </footer>
      </div>
    </main>
  )
}
