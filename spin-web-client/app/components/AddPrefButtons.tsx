import React, { useContext, useEffect, useState } from 'react'
import type { ArtistNotification, Records, ReleaseNotification, User } from '~/types'
import { AuthContext } from '~/components/AuthContext'
import { updateUser } from '~/functions'
import { SpinClient } from '~/api/client'
import * as _ from 'lodash'

interface ButtonProps {
  data: Records
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  setMessage: React.Dispatch<React.SetStateAction<{ title: string, message: string, type: string }>>
}

export default function AddPrefButtons(props: ButtonProps) {

  const { data } = props

  const userContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [submissionState, setSubmissionState] = useState<boolean>(false)
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
        setAlbumData({ album: data.album, type: 'Vinyl' })
      }
    }
    fetchData().catch()
  }, [userContext])

  async function addArtist(item: ArtistNotification) {
    setSubmissionState(true)
    if (userContext?.user === null) {
      props.setOpen(true)
      setSubmissionState(false)
      return
    }
    const next = (() => {
      const exists = artistFilters.some(t => _.isEqual(t, item))
      return exists
        ? artistFilters.filter(t => !_.isEqual(t, item))
        : [...artistFilters, item]
    })()

    setArtistFilters(next)
    await updateArtistState(next)
    setSubmissionState(false)
  }

  async function updateArtistState(nextArtists: ArtistNotification[]) {
    const update = { ...userData, artists: nextArtists }
    const result = await updateUser(userContext, client, update)
    if (result === 200) {
      props.setShow(true)
      props.setMessage({ title: 'Success', message: 'Information updated!', type: 'success' })
    } else {
      props.setShow(true)
      props.setMessage({ title: 'Error', message: 'Something went wrong :(', type: 'error' })
    }
  }

  async function addAlbum(item: ReleaseNotification) {
    setSubmissionState(true)
    if (userContext?.user === null) {
      props.setOpen(true)
      setSubmissionState(false)
      return
    }
    const next = (() => {
      const exists = releaseFilters.some(t => _.isEqual(t, item))
      return exists
        ? releaseFilters.filter(t => !_.isEqual(t, item))
        : [...releaseFilters, item]
    })()
    setReleaseFilters(next)
    await updateAlbumState(next)
    setSubmissionState(false)
  }

  async function updateAlbumState(nextReleases: ReleaseNotification[]) {
    const update = { ...userData, albums: nextReleases }
    const result = await updateUser(userContext, client, update)
    if (result === 200) {
      props.setShow(true)
      props.setMessage({ title: 'Success', message: 'Information updated!', type: 'success' })
    } else {
      props.setShow(true)
      props.setMessage({ title: 'Error', message: 'Something went wrong :(', type: 'error' })
    }
  }

  return (
    <div className='w-full mx-auto mb-3 flex flex-col space-y-2 pt-2 justify-center'>
      <button onClick={() => addAlbum(albumData)}
              disabled={submissionState}
              className='dark:bg-indigo-300 border-2 border-orange-400 dark:border-indigo-500 bg-orange-300 text-md rounded-xl w-full py-0.5 dark:hover:bg-indigo-500 disabled:opacity-50
                  disabled:cursor-not-allowed disabled:hover:bg-orange-300 disabled:dark:hover:bg-indigo-300'>
        Notify me for this album
      </button>
      <button onClick={() => addArtist(artistData)}
              disabled={submissionState}
              className='dark:bg-indigo-300 border-2 border-orange-400 dark:border-indigo-500 bg-orange-300 text-md rounded-xl w-full py-0.5 lg:px-0 px-1.5 dark:hover:bg-indigo-500 disabled:opacity-50
                  disabled:cursor-not-allowed disabled:hover:bg-orange-300 disabled:dark:hover:bg-indigo-300'>
        Notify me this artists releases
      </button>
    </div>
  )
}