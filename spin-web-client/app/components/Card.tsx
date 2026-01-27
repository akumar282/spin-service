import React from 'react'
import { useNavigate } from 'react-router'
import type { Records } from '~/types'
import { Notation } from '~/components/Notation'
import sorry from '../assets/sorry.webp'

interface CardProps {
  artist: string | null | undefined,
  album: string
  title: string
  color: string | null | undefined
  genre: string[]
  storeLink: string
  image: string | null
  data: Records
  preOrder: boolean,
  tag: string
}

export function generateTags(x: string, key: number) {
  const colorMap =
    new Map([
      ['Electronic', 'bg-blue-300'],
      ['Folk, World, & Country', 'bg-orange-300'],
      ['Rock', 'bg-red-300'],
      ['Pop', 'bg-indigo-300'],
      ['Hip Hop', 'bg-green-300'],
      ['R&B', 'bg-sky-300'],
      ['Blues', 'bg-blue-600'],
      ['Classical', 'bg-rose-300'],
      ['Funk / Soul', 'bg-yellow-300'],
      ['Stage & Screen', 'bg-orange-300'],
      ['Non-Music', 'bg-red-400'],
      ['Reggae', 'bg-teal-600'],
      ['Jazz', 'bg-fuchsia-300']

    ])
  const colors = ['bg-indigo-300', 'bg-green-300', 'bg-orange-300', 'bg-red-300', 'bg-emerald-300', 'bg-pink-300', 'bg-blue-300', 'bg-purple-300', 'bg-cyan-300', 'bg-sky-300', 'bg-lime-300', 'bg-rose-300']
  return (
    <div key={key} className={`rounded-4xl text-sm ${colorMap.get(x)} w-fit px-2 py-1 break-words`}>
      {x}
    </div>
  )
}

export function Card(props: CardProps) {

  const navigate = useNavigate()

  return (
    <div onClick={() => navigate(`/release/${props.data.postId}`, { state: { data: props.data } })}
      className=' bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 dark:text-black transition ease-in-out border-orange-400 hover:-translate-y-1 hover:scale-105 dark:border-indigo-500 w-[18rem] h-[22.5rem] border-2 font-primary m-auto rounded-2xl shadow-2xl'>
      <div className='flex flex-col h-full items-start'>
        <div className='flex flex-row'>
          {Notation(props.tag, props.preOrder, 1)}
        </div>
        <div className='aspect-square h-37 w-37 md:h-39 md:w-39 lg:h-41 lg:w-41 mb-2 mx-auto rounded'>
          <img
            alt='cover'
            src={props.image && props.image !== '' ? props.image : sorry}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='flex flex-col items-center h-full w-full min-h-0 overflow-hidden text-center mx-auto'>
          <h1 className='w-full px-2 my-1 text-lg leading-tight line-clamp-2 break-words'>
            {props.album}
          </h1>
          <h2 className='w-full px-2 italic text-md leading-tight mt-1 line-clamp-2 break-words'>
            {props.artist}
          </h2>
          <div className='w-full px-2 mt-3 min-h-0 overflow-hidden'>
            <div className='flex flex-wrap justify-center gap-2 max-h-full overflow-hidden'>
              {props.genre?.map((x, index) => generateTags(x, index))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}