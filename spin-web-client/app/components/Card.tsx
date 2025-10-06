import React from 'react'

interface CardProps {
  artist: string | null | undefined
  title: string
  color: string | null | undefined
  genre: string[]
  storeLink: string
  image: string | null
}

const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

function generateTags(x: string, key: number) {
  const colors = ['bg-indigo-300', 'bg-green-300', 'bg-orange-300', 'bg-red-300', 'bg-emerald-300', 'bg-pink-300']
  const color = colors.at(getRandomInt(colors.length))
  return (
    <div key={key} className={`rounded-4xl text-sm ${color}  px-2 py-1 break-words`}>
      {x}
    </div>
  )
}

export function Card(props: CardProps) {
  return (
    <div
      className=' bg-white/80 border dark:text-black border-white w-[18rem] h-[22.5rem] border-2 font-primary m-auto rounded-2xl shadow-2xl'>
      <div className='flex flex-col h-full items-center'>
        <button className='dark:bg-indigo-300 bg-orange-300 mr-40 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
          <h1>
            New Release
          </h1>
        </button>
        <div className='aspect-square h-24 w-24 md:h-32 md:w-32 lg:h-32 lg:w-32 mb-2 mx-auto rounded'>
          <img
            alt='cover'
            src={props.image ?? alternateImage}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='flex flex-col items-center h-full overflow-hidden text-center mx-auto'>
          <h1 className='lg:text-md max-h-19 text-md text-wrap truncate pb-2 mx-2'>
            {props.title}
          </h1>
          <h1 className='lg:text-md text-sm text-wrap truncate italic mx-2'>
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