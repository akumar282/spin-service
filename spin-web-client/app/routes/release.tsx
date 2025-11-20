import React, { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import HomeNavbar from '~/components/HomeNavbar'
import {
  type Artist, type ArtistNotification,
  type Master,
  type Release,
  type ReleaseNotification,
  type SearchResult,
  unwrap, type User
} from '~/types'
import { SpinClient } from '~/api/client'
import { generateTags } from '~/components/Card'
import { AuthContext } from '~/components/AuthContext'
import { updateUser } from '~/functions'

export default function ReleasePage() {
  // const params = useParams()
  const location = useLocation()
  const userContext = useContext(AuthContext)

  const { data }  = location.state
  const [results, setResults] = useState<(Release | null)>(null)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [releaseFilters, setReleaseFilters] = useState<ReleaseNotification[]>([])
  const [artistFilters, setArtistFilters] = useState<ArtistNotification[]>([])
  const [albumData, setAlbumData] = useState<ReleaseNotification>({ album: '', type: '' })
  const [artistData, setArtistData] = useState<ArtistNotification>({ artist: '', type: '' })

  const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'
  const client = new SpinClient()
  
  function cap(inputString: string): string {
    if (!inputString) {
      return inputString
    }
    return inputString.charAt(0).toUpperCase() + inputString.slice(1)
  }

  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchData = async () => {
      const request = unwrap(await client.getData<SearchResult>(`search/search?q=${data.title}`))
      const filteredResults: Release[] = request.results.filter((x: (Artist | Release | Master)) => x.type != 'master' && x.type != 'artist')
      setResults(filteredResults.at(0)!)
      if (userContext?.user?.data) {
        const user = userContext.user.data
        setUserData(user)
        setArtistFilters(user.artists)
        setReleaseFilters(user.albums)
        setArtistData({ artist: data.artist, type: 'artist' })
        setAlbumData({ album: data.title, type: 'vinyl' })
      }
    }
    fetchData().catch()
  }, [userContext])

  async function addArtist(item: ArtistNotification) {
    setArtistFilters(prev => {
      const exists = prev.some(t => JSON.stringify(t) === JSON.stringify(item))
      const next = exists
        ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(item))
        : [...prev, item]

      updateArtistState(next)
      return next
    })
  }

  async function updateArtistState(nextArtists: ArtistNotification[]) {
    const update = { ...userData, artists: nextArtists }
    await updateUser(userContext, client, update)
  }

  async function addAlbum(item: ReleaseNotification) {
    setReleaseFilters(prev => {
      const exists = prev.some(t => JSON.stringify(t) === JSON.stringify(item))
      const next = exists
        ? prev.filter(t => JSON.stringify(t) !== JSON.stringify(item))
        : [...prev, item]

      updateAlbumState(next)
      return next
    })
  }

  async function updateAlbumState(nextReleases: ReleaseNotification[]) {
    const update = { ...userData, albums: nextReleases }
    await updateUser(userContext, client, update)
  }

  return (
    <main>
      <div
        className='flex text-black flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
        <HomeNavbar/>
        <div className='w-full items-center max-w-[116rem] pt-3 flex flex-col'>
          <div
            className='w-[98%] justify-between my-0.5 rounded dark:bg-slate-300 dark:text-black dark:border-indigo-600 rounded-xl bg-white flex flex-row border border-slate-400 items-stretch'>
            <div className='flex w-full lg:flex-row md:flex-row flex-col'>
              <div className='flex items-center justify-center lg:m-3 m-3'>
                <div className='h-[180px] w-[180px] lg:w-[220px] lg:h-[220px] flex-shrink-0'>
                  <img
                    className='h-full w-full object-cover rounded'
                    src={data.thumbnail !== null  ? data.thumbnail : alternateImage}
                    alt='title'
                  />
                </div>
              </div>
              <div className='lg:m-5 m-2 lg:w-full md:w-full flex flex-col'>
                <h1 className='text-lg'>
                  {data.album}
                </h1>
                <h3 className='text-md mb-3  text-wrap'>
                  {data.artist}
                </h3>
                <h3 className='text-sm italic  text-wrap'>
                  {'Release'}
                </h3>
                <h3 className='text-sm italic text-wrap'>
                  {results?.year}
                </h3>
                <h3 className='text-sm italic text-wrap'>
                  Format: {cap(data.media)}
                </h3>
                <h3 className='text-sm text-blue-700 mt-2'>
                  <a target='_blank' title={'View on Discogs'} href={'https://discogs.com' + data.uri}
                     rel='noreferrer'>View full information
                    on Discogs</a>
                </h3>
                <div className='lg:m-5 flex flex-wrap mt-3 justify-center gap-2'>
                  {data.genre ?
                    data.genre.map((x: string, index: number) => generateTags(x, index)) : <></>
                  }
                </div>
                <div className='w-full mt-auto mx-auto mb-3 flex flex-col space-y-2 pt-3 justify-center'>
                  <a
                    target='_blank'
                    className='text-center dark:bg-indigo-300 border-2 border-indigo-600 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'
                    title={'View on Discogs'}
                    href={data.content}
                    rel='noreferrer'>
                    Buy now (Go to this drop)
                  </a>
                  <button onClick={() => addAlbum(albumData)}
                          className='dark:bg-indigo-300 border-2 border-indigo-600 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
                    Notify me for this album
                  </button>
                  <button onClick={() => addArtist(artistData)}
                          className='dark:bg-indigo-300 border-2 border-indigo-600 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
                    Notify me this artists releases
                  </button>
                </div>
              </div>
            </div>
            {/*<button className='lg:mr-5 mr-2 my-auto' onClick={() => (data.buttonFunction(), data.checked = true)}>*/}
            {/*  <div className='h-10 w-10'>*/}
            {/*    {!data.checked ? (<img src={plus} alt='Plus'/>) : (*/}
            {/*      <img className='rotate-45' src={plus} alt='Plus'/>*/}
            {/*    )}*/}
            {/*  </div>*/}
            {/*</button>*/}
          </div>
        </div>
      </div>
    </main>
  )
}