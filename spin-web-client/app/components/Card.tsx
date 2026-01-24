import React from 'react'
import { useNavigate } from 'react-router'
import type { Records } from '~/types'
import { Notation } from '~/components/Notation'

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

const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export function generateTags(x: string, key: number) {
  const colors = ['bg-indigo-300', 'bg-green-300', 'bg-orange-300', 'bg-red-300', 'bg-emerald-300', 'bg-pink-300', 'bg-blue-300']
  const color = colors.at(getRandomInt(colors.length))
  return (
    <div key={key} className={`rounded-4xl text-sm ${color} w-fit px-2 py-1 break-words`}>
      {x}
    </div>
  )
}

export function Card(props: CardProps) {

  const navigate = useNavigate()

  return (
    <div onClick={() => navigate(`/release/${props.data.postId}`, { state: { data: props.data } })}
      className=' bg-white/80 dark:text-black transition ease-in-out border-orange-400 hover:-translate-y-1 hover:scale-105 dark:border-indigo-500 w-[18rem] h-[22.5rem] border-2 font-primary m-auto rounded-2xl shadow-2xl'>
      <div className='flex flex-col h-full items-start'>
        <div className='flex flex-row'>
          {Notation(props.tag, props.preOrder, 1)}
        </div>
        <div className='aspect-square h-37 w-37 md:h-39 md:w-39 lg:h-41 lg:w-41 mb-2 mx-auto rounded'>
          <img
            alt='cover'
            src={props.image && props.image !== '' ? props.image : alternateImage}
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