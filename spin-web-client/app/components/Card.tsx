import React from 'react'

interface CardProps {
  artist: string | null | undefined
  title: string
  color: string | null | undefined
  genre: string[]
  storeLink: string
}

export function Card(props: CardProps) {
  return (
    <div
      className=' bg-white/80 border dark:text-black border-white max-w-[18rem] min-w-[15rem] border-2 font-primary m-auto rounded-2xl shadow-2xl'>
      <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
        <h1>
          New Release
        </h1>
      </button>
      <div className='flex flex-col items-center'>
        <img alt='cover' className=' my-4'
             src='https://i.discogs.com/3jIXeeFG8I_JDCJLzD2WTpatabGHMeHqOBxjJibqU1A/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEzODU1/MDE5LTE2MzYxMjI1/NzctMTA1NC5qcGVn.jpeg'/>
        <div className='flex flex-col items-center text-center mx-auto'>
          <h1 className='lg:text-lg text-md text-wrap truncate pb-2 px-2'>
            {props.title}
          </h1>
          <h1 className='lg:text-md text-sm truncate italic'>
            {props.artist}
          </h1>
          <div className='flex m-3 space-x-2 flex-row wrap-anywhere'>
            <div className='rounded-4xl text-sm bg-indigo-300 px-2 py-1'>
              Rock
            </div>
            <div className='rounded-4xl text-sm bg-amber-200 px-2 py-1'>
              Rock
            </div>
            <div className='rounded-4xl text-sm bg-green-300 px-2 py-1'>
              Rock
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}