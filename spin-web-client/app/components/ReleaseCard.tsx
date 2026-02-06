import React from 'react'
import { useNavigate } from 'react-router'
import type { Records } from '~/types'
import { Notation } from '~/components/Notation'
import sorry from '../assets/sorry.webp'

interface ReleaseCardProps {
  preOrder: boolean
  upcoming: boolean
  title: string
  artist: string
  linkTo: string
  data: Records,
  tag: string
}

export default function ReleaseCard(props: ReleaseCardProps) {

  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/release/${props.data.postId}`, { state: { data: props.data } })}
      className='dark:bg-slate-300 transition ease-in-out mx-3 lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 mx-auto border flex flex-col border-2 dark:border-indigo-600 border-orange-400 overflow-hidden rounded-2xl lg:h-76 flex-shrink-0 lg:w-54 h-64 w-44'>
      <div className='flex flex-row'>
        { Notation(props.tag, props.preOrder, 0) }
      </div>
      <div className='lg:h-34 lg:w-34 overflow-hidden md:h-30 md:w-30 h-27 w-27 mx-auto'>
        <img
          alt='cover'
          className='h-full w-full object-cover'
          src={props.linkTo && props.linkTo !== '' ? props.linkTo : sorry}
        />
      </div>
      <div className='w-[90%] mt-1 mx-auto'>
        <h1 className='text-wrap max-h-13 truncate text-md'>
          {props.title}
        </h1>
        <h3 className='truncate italic lg:mb-0 md:mb-1 mb-1 mt-1 text-sm'>
          {props.artist}
        </h3>
      </div>
      <div className='w-[90%] mt-auto mx-auto mb-3 mt-1 flex justify-center'>
        <button onClick={() => navigate(`/release/${props.data.postId}`, { state: { data: props.data } })} className='dark:bg-indigo-300 bg-orange-300 text-md rounded-xl w-full py-0.5 border-2 dark:border-indigo-500 border-orange-400 dark:hover:bg-indigo-500'>
          Get Notified
        </button>
      </div>
    </div>
  )
}