import React from 'react'
import plus from './assets/plus.svg'
export function ResultComponent() {
  return (
    <div className='w-[99%] justify-between my-0.5 rounded rounded-xl bg-white flex flex-row border border-slate-400'>
      <div className='flex flex-row'>
        <div className='h-16 my-auto ml-3 w-16'>
          <div className='rounded-full w-full h-full bg-slate-500'>

          </div>
        </div>
        <div className='m-5'>
          <h1 className='text-lg'>
            Artist
          </h1>
          <h3 className='text-sm italic'>
            Artist
          </h3>
        </div>
      </div>
      <button className='mr-5'>
        <div className='h-10 w-10'>
          <img src={plus}/>
        </div>
      </button>
    </div>
  )
}