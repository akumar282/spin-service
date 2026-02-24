import React from 'react'

interface AlertProps {
  show: boolean
  closeAlert: () => void
  title: string,
  message: string,
  type: string
}

export default function Alert(props: AlertProps) {

  const styles: Record<string, { container: string, closeIcon: string }> = {
    error: {
      container: 'text-red-800 border-red-300 rounded-lg bg-red-100 dark:bg-gray-800 dark:text-red-400 dark:border-red-800',
      closeIcon: 'text-red-800 dark:text-red-400'
    },
    warn: {
      container: 'text-yellow-800 border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300',
      closeIcon: 'text-yellow-800 dark:text-yellow-400'
    },
    success: {
      container: 'text-green-800 border-green-400 rounded-lg bg-green-100 dark:bg-gray-800 dark:text-green-400',
      closeIcon: 'text-green-800 dark:text-green-400'
    }
  }

  const selectedStyle = styles[props.type]

  if (!props.show) {
    return null
  }

  return (
    <div className={`flex items-center text-center p-4 mb-4 lg:w-8/10 w-[97%] text-sm border opacity-100 transition-opacity duration-300 ease-in-out ${selectedStyle.container} transition-all duration-300 ease-out`} role='alert'>
      <svg className='flex-shrink-0 inline w-4 h-4 mr-3' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z' />
      </svg>
      <span className='sr-only'>Info</span>
      <div>
        <span className='font-medium px-2'>{props.title}</span>
        <span className='font-medium mx-1'></span>{props.message}
      </div>
      <button className='ml-auto px-2' onClick={props.closeAlert}>
        <svg
          className={`w-4 h-4 ${selectedStyle.closeIcon}`}
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 22 22'
          stroke='currentColor'
        >
          <path d='M6 18L18 6M6 6l12 12'></path>
        </svg>
      </button>
    </div>
  )
}
  