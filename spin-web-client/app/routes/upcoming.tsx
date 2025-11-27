import React, { useState } from 'react'
import { useLocation } from 'react-router'
import HomeNavbar from '~/components/HomeNavbar'
import { generateTags } from '~/components/Card'
import AuthModal from '~/components/AuthModal'
import AddPrefButtons from '~/components/AddPrefButtons'

export default function ReleasePage() {
  const location = useLocation()

  const { data }  = location.state
  const [open, setOpen] = useState<boolean>(false)

  const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'

  return (
    <main>
      <div
        className='flex text-black flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <AuthModal open={open} setOpen={setOpen}/>
        <div className='w-full items-center max-w-[116rem] pt-3 flex flex-col'>
          <div
            className='w-[98%] justify-between my-0.5 rounded dark:bg-slate-300 dark:text-black dark:border-indigo-600 rounded-xl bg-white flex flex-col border border-slate-400 items-stretch'>
            <div>

            </div>
            <div className='flex w-full justify-center'>
              <div className='mx-2 lg:w-full md:w-full flex grow flex-col'>
                <div className='flex flex-col lg:flex-row md:flex-row'>
                  <div className='flex flex-col items-center justify-center lg:m-3 m-3'>
                    <div className='h-[200px] w-[200px] md:h-[200px] md:w-[200px] lg:w-[220px] lg:h-[220px] flex-shrink-0'>
                      <img
                        className='h-full w-full object-cover rounded'
                        src={data.thumbnail && data.thumbnail !== '' ? data.thumbnail : alternateImage}
                        alt='title'
                      />
                    </div>
                  </div>
                  <div className='lg:ml-2'>
                    <h1 className='lg:text-2xl text-xl mt-3'>
                      {data.album}
                    </h1>
                    <h3 className='lg:text-xl text-lg mb-3  text-wrap'>
                      {data.artist}
                    </h3>
                    <h3 className='lg:text-md text-sm italic  text-wrap'>
                      {'Release'}
                    </h3>
                    <h3 className='lg:text-md text-sm italic  text-wrap'>
                      {data.date}
                    </h3>
                    <h3 className='lg:text-md text-sm italic  text-wrap'>
                      {data.note}
                    </h3>
                  </div>
                </div>
                <div className='my-3 flex flex-wrap justify-center gap-2'>
                  {data.genre ?
                    data.genre.map((x: string, index: number) => generateTags(x, index)) : <></>
                  }
                </div>
                <AddPrefButtons data={data} setOpen={setOpen} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}