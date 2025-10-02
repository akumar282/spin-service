import React from 'react'

interface ReleaseCardProps {
  preOrder: boolean
  upcoming: boolean
  title: string
  artist: string
  linkTo: string
}

export default function ReleaseCard(props: ReleaseCardProps) {
  return (
    <div className='dark:bg-slate-300 transition ease-in-out mx-3 lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-slate-100 mx-auto border flex flex-col border-2 dark:border-indigo-600 border-orange-400 overflow-hidden rounded-2xl lg:h-68 flex-shrink-0 lg:w-52 h-60 w-44'>
      <div>
        <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
          <h1>
            Preorder
          </h1>
        </button>
      </div>
      <div className='lg:h-32 lg:w-32 h-24 w-24 mx-auto'>
        <img
          alt='cover'
          className=''
          src={props.linkTo}
        />
      </div>
      <div className='w-[90%] mt-1 mx-auto'>
        <h1 className='text-wrap truncate text-lg'>
          {props.title}
        </h1>
        <h3 className='truncate italic'>
          {props.artist}
        </h3>
      </div>
      <div className='w-[90%] mx-auto mt-3 flex justify-center'>
        <button className='dark:bg-indigo-300 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
          Get Notified
        </button>
      </div>
    </div>
  )
}