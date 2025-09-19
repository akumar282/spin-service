import React, {type ChangeEventHandler, useState} from 'react'
import type { Route } from '../+types/root'
import HomeNavbar from '~/components/HomeNavbar'
import debounce from 'lodash/debounce'
import type {Records} from '~/types'


export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Browse() {

  const [highlighted, setHighlighted] = useState<Partial<Records>[] | null>(null)
  const [data, setData] = useState<Records[] | null>(null)

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    console.log(e.target.value)
    if (data !== null) {
      const search = data.filter((record) => record.title.toLowerCase().includes(e.target.value.toLowerCase()))
      setHighlighted(search)
    }
  }

  const debounced = debounce(onChange, 500)

  return (
    <main
      className='flex flex-col font-primary dark:text-black items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
      <HomeNavbar/>
      <div className='max-w-[1500px] space-y-2 flex flex-col w-11/12 mt-10 dark:text-white'>
        <h1 className='text-2xl'>
          Latest Releases
        </h1>
        <h3>
          Items here have released in the past 24 hours
        </h3>
        <div>
          <input
            className='text-start py-1 bg-slate-100 text-black text-base mt-3 rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-600 w-full'
            placeholder='Search for recent releases'
            type='text'
            onChange={debounced}
          />
        </div>
      </div>
    </main>
  )
}
