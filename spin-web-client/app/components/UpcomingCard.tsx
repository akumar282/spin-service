import React from 'react'
import { useNavigate } from 'react-router'
import type { Upcoming } from '~/types'

interface ReleaseCardProps {
  upcoming: boolean
  title: string
  artist: string
  data: Upcoming,
  date: string
}

export default function UpcomingCard(props: ReleaseCardProps) {

  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/upcoming/${props.data.id}`, { state: { data: props.data } })}
      className='bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:bg-gradient-to-b dark:from-slate-300 dark:via-white dark:to-slate-300 transition ease-in-out mx-3 text-black lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-slate-100 mx-auto border flex flex-col border-2 dark:border-indigo-600 border-orange-400 overflow-hidden rounded-2xl lg:h-66 flex-shrink-0 lg:w-54 h-60 w-44'>
      <div className='flex flex-row'>
        <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
          <h1>
            Upcoming
          </h1>
        </button>
      </div>
      <div className='w-[90%] mt-3 h-full flex flex-col justify-between space-y-3 mx-auto'>
        <div>
          <h1 className='text-wrap text-lg max-h-13 truncate'>
            {props.title}
          </h1>
          <h3 className='text-wrap mt-1 italic text-md'>
            {props.artist}
          </h3>
        </div>
        <h3 className='text-wrap mt-3 ml-1 italic mb-3 text-sm'>
          {props.date}
        </h3>
      </div>
      <div className='w-[90%] mt-auto mx-auto mb-3 flex justify-center'>
      <button onClick={() => navigate(`/upcoming/${props.data.id}`, { state: { data: props.data } })} className='dark:bg-indigo-300 bg-orange-300 text-md rounded-xl w-full py-0.5 border-2 dark:border-indigo-500 border-orange-400 dark:hover:bg-indigo-500'>
          Get Notified
        </button>
      </div>
    </div>
  )
}