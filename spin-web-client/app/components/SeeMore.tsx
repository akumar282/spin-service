import React from 'react'
import { useNavigate } from 'react-router'
import plus from './assets/plus.svg'

export default function SeeMore() {

  const navigate = useNavigate()

  return (
    <div className='dark:bg-slate-300 border-4 border-dashed dark:hover:bg-purple-300 hover:bg-orange-300 justify-center transition ease-in-out mx-3 lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-slate-100 mx-auto border flex flex-col dark:border-indigo-600 border-orange-400 overflow-hidden rounded-2xl lg:h-76 flex-shrink-0 lg:w-54 h-64 w-44'>
      <div className='w-[90%] mx-auto flex'>
        <button onClick={() => navigate('/browse')} className='text-wrap items-center text-center mx-auto truncate text-xl'>
          See More
          <img className='mx-auto' height={100} width={100} alt={'Plus image'} src={plus}/>
        </button>
      </div>
    </div>
  )
}