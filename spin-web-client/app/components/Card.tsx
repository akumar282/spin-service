import React from 'react'

interface CardProps {
  artist: string
  title: string
  color: string
  genre: string[]
  storeLink: string
}

export function Card() {
  return (
    <div className=' bg-white/80 border border-white border-2 font-primary rounded-2xl shadow-2xl'>
      <div className='flex flex-col items-center'>
        <img alt='cover' className=' my-4'
             src='https://i.discogs.com/3jIXeeFG8I_JDCJLzD2WTpatabGHMeHqOBxjJibqU1A/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEzODU1/MDE5LTE2MzYxMjI1/NzctMTA1NC5qcGVn.jpeg' />
        <div className='flex flex-col items-center text-center mx-auto'>
          <h1 className='lg:text-lg text-md pb-2 px-2'>
            Mac Demarco - Old Dog Demos
          </h1>
          <h1 className='lg:text-md text-sm'>
            Artist: Mac Demarco
          </h1>
          <div className='flex m-3 space-x-2 flex-row wrap-anywhere'>
            <div className='rounded-4xl text-sm bg-slate-300 px-2 py-1'>
              Rock
            </div>
            <div className='rounded-4xl text-sm bg-slate-300 px-2 py-1'>
              Rock
            </div>
            <div className='rounded-4xl text-sm bg-slate-300 px-2 py-1'>
              Rock
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}