import React, { useContext, useEffect, useState } from 'react'
import type { ArtistNotification, Records, ReleaseNotification, User } from '~/types'
import { AuthContext } from '~/components/AuthContext'
import { updateUser } from '~/functions'
import { SpinClient } from '~/api/client'

interface ButtonProps {
  data: Records
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddPrefButtons(props: ButtonProps) {

  const { data } = props

  const userContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [releaseFilters, setReleaseFilters] = useState<ReleaseNotification[]>([])
  const [artistFilters, setArtistFilters] = useState<ArtistNotification[]>([])
  const [albumData, setAlbumData] = useState<ReleaseNotification>({ album: '', type: '' })
  const [artistData, setArtistData] = useState<ArtistNotification>({ artist: '', type: '' })

  const client = new SpinClient()

  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchData = async () => {
      if (userContext?.user?.data) {
        const user = userContext.user.data
        setUserData(user)
        setArtistFilters(user.artists)
        setReleaseFilters(user.albums)
        setArtistData({ artist: data.artist!, type: 'artist' })
        setAlbumData({ album: data.title, type: 'vinyl' })
      }
    }
    fetchData().catch()
  }, [userContext])

  async function addArtist(item: ArtistNotification) {
    if (userContext?.user === null) {
      props.setOpen(true)
      return
    }
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
    if (userContext?.user === null) {
      props.setOpen(true)
      return
    }
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
    <div className='w-full mx-auto mb-3 flex flex-col space-y-2 pt-2 justify-center'>
      <button onClick={() => addAlbum(albumData)}
              className='dark:bg-indigo-300 border-2 border-indigo-600 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500'>
        Notify me for this album
      </button>
      <button onClick={() => addArtist(artistData)}
              className='dark:bg-indigo-300 border-2 border-indigo-600 bg-orange-300 text-md rounded-xl w-full py-0.5 lg:px-0 px-1.5 dark:hover:bg-indigo-500'>
        Notify me this artists releases
      </button>
    </div>
  )
}