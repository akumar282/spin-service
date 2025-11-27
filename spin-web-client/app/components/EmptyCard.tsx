import React from 'react'

export default function EmptyCard() {
  return (
    <div
      className='dark:bg-slate-800 animate-pulse transition ease-in-out mx-3 lg:my-6 md:my-6 my-4 hover:-translate-y-3 hover:scale-105 bg-slate-100 mx-auto border flex flex-col border-2 border-slate-500 overflow-hidden rounded-2xl lg:h-76 flex-shrink-0 lg:w-54 h-64 w-44'>
      <div className='flex flex-row dark:bg-slate-800 bg-slate-100'>
        <div className='dark:bg-slate-500 bg-slate-400 rounded-full mt-2 ml-2 mb-2 py-2 px-8 text-sm'>
        </div>
      </div>
      <div className='lg:h-32 rounded dark:bg-slate-500 bg-slate-400 lg:w-32 h-24 w-24 mx-auto'></div>
      <div className='w-[90%] mt-5 mx-auto'>
        <div className='text-wrap py-2 rounded w-[90%] dark:bg-slate-500 bg-slate-400 max-h-13 truncate text-md'>
        </div>
        <div className='truncate py-2 rounded mt-2 w-[70%] dark:bg-slate-500 bg-slate-400 italic text-sm'>
        </div>
      </div>
      <div className='w-[90%] mt-auto mx-auto mb-3 flex justify-center'>
        <div
          className='dark:bg-slate-500 bg-slate-400 text-md rounded-xl w-full py-3.5 dark:hover:bg-indigo-500'>
        </div>
      </div>
    </div>
  )
}