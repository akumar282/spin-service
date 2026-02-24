import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import HomeNavbar from '~/components/HomeNavbar'
import { generateTags } from '~/components/Card'
import { cap } from '~/functions'
import { Notation } from '~/components/Notation'
import AddPrefButtons from '~/components/AddPrefButtons'
import AuthModal from '~/components/AuthModal'
import Alert from '~/components/Alert'
import sorry from '../assets/sorry.webp'
import { type Records, unwrap } from '~/types'
import { SpinClient } from '~/api/client'
import LoadingScreen from '~/components/LoadingScreen'
import Footer from '~/components/Footer'

export default function ReleasePage() {
  const location = useLocation()
  const { rid } = useParams()

  const data = (location.state)?.data ?? null
  const [open, setOpen] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })
  const [info, setInfo] = useState<Records | null>(data)
  const [loading, setLoading] = useState<boolean>(!data)

  const client = new SpinClient()

  const useShare = async () => {
    setLoading(true)
    const result = unwrap(await client.getData<Records>(`public/${rid}`))
    setInfo(result)
    setLoading(false)
  }

  useEffect(() => {
    if (!info && rid) {
      useShare().catch(() => setLoading(false))
    }
  }, [rid])

  const notation = info ?  Notation(info.releaseType, info.preorder, 2) : null

  return (
    loading || !info ? (
      <LoadingScreen />
    ) : (
      <main className='flex text-black flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <AuthModal open={open} setOpen={setOpen}/>
        <div className='w-full'>
          <HomeNavbar/>
          <div className='w-full mt-3 flex justify-center'>
            <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message}
                   type={message.type}/>
          </div>
          <div className='w-full items-center max-w-[116rem] pt-2 flex flex-col'>
            <div
              className='w-[98%] justify-between my-0.5 rounded dark:bg-slate-300 dark:text-black dark:border-indigo-600 rounded-xl bg-white flex flex-col border border-slate-400 items-stretch'>
              <div>
                {notation}
              </div>
              <div className='flex w-full justify-center'>
                <div className='mx-2 lg:w-full md:w-full flex grow flex-col'>
                  <div className='flex flex-col lg:flex-row md:flex-row'>
                    <div className='flex flex-col items-center justify-center lg:m-3 m-3'>
                      <div
                        className='h-[200px] w-[200px] md:h-[200px] md:w-[200px] lg:w-[220px] lg:h-[220px] flex-shrink-0'>
                        <img
                          className='h-full w-full object-cover rounded'
                          src={info.thumbnail && info.thumbnail !== '' ? info.thumbnail : sorry}
                          alt='title'
                        />
                      </div>
                    </div>
                    <div className='lg:ml-2'>
                      <h1 className='lg:text-2xl text-xl mt-3'>
                        {info.album}
                      </h1>
                      <h3 className='lg:text-xl text-lg mb-3  text-wrap'>
                        {info.artist}
                      </h3>
                      <h3 className='lg:text-md text-sm italic  text-wrap'>
                        {'Release'}
                      </h3>
                      <h3 className='lg:text-md text-sm italic text-wrap'>
                        {info.year}
                      </h3>
                      <h3 className='lg:text-md text-sm text-smitalic text-wrap'>
                        Format: {cap(info.media)}
                      </h3>
                      <h3 className='lg:text-md text-sm italic text-wrap'>
                        Color: {cap(info.color)}
                      </h3>
                      <h3 className='lg:text-md text-sm text-blue-700 mt-2'>
                        <a target='_blank' title={'View on Discogs'} href={'https://discogs.com' + info.uri}
                           rel='noreferrer'>View full information
                          on Discogs</a>
                      </h3>
                    </div>
                  </div>
                  <div className='my-3 flex flex-wrap justify-center gap-2'>
                    {info.genre ?
                      info.genre.map((x: string, index: number) => generateTags(x, index)) : <></>
                    }
                  </div>
                  <div className='w-full mt-auto mx-auto mb-3 flex flex-col pt-3 justify-center'>
                    <a
                      target='_blank'
                      className='text-center dark:bg-indigo-300 border-2 border-orange-400 dark:border-indigo-500 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'
                      title={'View on Discogs'}
                      href={info.content}
                      rel='noreferrer'>
                      Buy now (Go to this drop)
                    </a>
                    <AddPrefButtons data={info} setOpen={setOpen} setShow={setShow} setMessage={setMessage}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </main>
    )
  )
}