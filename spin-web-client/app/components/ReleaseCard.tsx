import React from 'react'
import { useNavigate } from 'react-router'
import type { Records } from '~/types'

interface ReleaseCardProps {
  preOrder: boolean
  upcoming: boolean
  title: string
  artist: string
  linkTo: string
  data: Records
}

const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'

export default function ReleaseCard(props: ReleaseCardProps) {

  const navigate = useNavigate()

  return (
    <div className='dark:bg-slate-300 transition ease-in-out mx-3 lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-slate-100 mx-auto border flex flex-col border-2 dark:border-indigo-600 border-orange-400 overflow-hidden rounded-2xl lg:h-76 flex-shrink-0 lg:w-54 h-64 w-44'>
      <div>
        {
          props.preOrder ? (
            <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
              <h1>
                Preorder
              </h1>
            </button>
          ) : (
            <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
              <h1>

              </h1>
            </button>
          )
        }
      </div>
      <div className='lg:h-32 lg:w-32 h-24 w-24 mx-auto'>
        <img
          alt='cover'
          className=''
          src={props.linkTo && props.linkTo !== '' ? props.linkTo : alternateImage}
        />
      </div>
      <div className='w-[90%] mt-1 mx-auto'>
        <h1 className='text-wrap max-h-13 truncate text-md'>
          {props.title}
        </h1>
        <h3 className='truncate italic text-sm'>
          {props.artist}
        </h3>
      </div>
      <div className='w-[90%] mt-auto mx-auto mb-3 flex justify-center'>
        <button onClick={() => navigate(`/release/${props.data.postId}`, { state: { data: props.data } })} className='dark:bg-indigo-300 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
          Get Notified
        </button>
      </div>
    </div>
  )
}