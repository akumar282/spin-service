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
    <div className='bg-slate-300 mx-auto border flex flex-col border-2 border-indigo-600 overflow-hidden rounded-2xl lg:h-68 flex-shrink-0 lg:w-52 h-60 w-44'>
      <div>
        <button className='bg-indigo-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
          <h1>
            Preorder
          </h1>
        </button>
      </div>
      <div className='lg:h-32 lg:w-32 h-24 w-24 mx-auto'>
        <img
          alt='cover'
          className=''
          src='https://upload.wikimedia.org/wikipedia/commons/0/0e/Playboi_Carti_-_Music_album_cover.svg'
        />
      </div>
      <div className='w-[90%] mt-1 mx-auto'>
        <h1 className='text-wrap truncate text-lg'>
          Music
        </h1>
        <h3 className='truncate italic'>
          Playboi Carti
        </h3>
      </div>
      <div className='w-[90%] mx-auto mt-3 flex justify-center'>
        <button className='bg-indigo-300 rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
          Get Notified
        </button>
      </div>
    </div>
  )
}