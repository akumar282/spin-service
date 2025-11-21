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
  const colors = ['bg-indigo-300', 'bg-green-300', 'bg-orange-300', 'bg-red-300', 'bg-emerald-300', 'bg-pink-300']
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
      className=' bg-white/80 border dark:text-black border-white w-[18rem] h-[22.5rem] border-2 font-primary m-auto rounded-2xl shadow-2xl'>
      <div className='flex flex-col h-full items-start'>
        <div className='flex flex-row'>
          { Notation(props.tag, props.preOrder, 1) }
        </div>
        <div className='aspect-square h-30 w-30 md:h-33 md:w-33 lg:h-34 lg:w-34 mb-2 mx-auto rounded'>
          <img
            alt='cover'
            src={props.image && props.image !== '' ? props.image : alternateImage}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='flex flex-col items-center h-full overflow-hidden text-center mx-auto'>
          <h1 className='lg:text-lg max-h-19 text-lg/5 my-1 text-wrap truncate mx-2'>
            {props.album}
          </h1>
          <h1 className='lg:text-md text-md text-wrap truncate italic mx-2'>
            {props.artist}
          </h1>
          <div className='flex flex-wrap mt-3 justify-center mx-2 gap-2'>
            {
              props.genre !== undefined ? props.genre.map((x, index) => generateTags(x , index)) : <></>
            }
          </div>
        </div>
      </div>
    </div>
  )
}