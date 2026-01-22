import type { Route } from './+types/home'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '~/components/AuthContext'
import { type User } from '~/types'
import { SpinClient } from '~/api/client'
import LoadingScreen from '~/components/LoadingScreen'
import HomeNavbar from '~/components/HomeNavbar'
import { updateUser } from '~/functions'
import Alert from '~/components/Alert'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'channels | spin-service' },
    { name: 'spin service notification types', content: 'set how you want to be notified' },
  ]
}

export default function Channels() {
  const userContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [notification, setNotifications] = useState<string[]>([])
  const [submissionState, setSubmissionState] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })

  const client = new SpinClient()
  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchUser = async () => {
      if (userContext?.user?.data) {
        const data = userContext.user.data
        setUserData(data)
        setNotifications(data.notifyType)
      }
    }

    fetchUser().catch()
  }, [userContext])

  function handleClick(value: string) {
    const copy = [...notification]
    const index = copy.indexOf(value)
    if (index !== -1) {
      copy.splice(index, 1)
    } else {
      copy.push(value)
    }
    setNotifications(copy)
  }

  const useSubmitNotifcation = async () => {
    setSubmissionState(true)
    const update = Object.assign({}, userData, { notifyType: notification })
    const result = await updateUser(userContext, client, update)
    if (result === 200) {
      setShow(true)
      setMessage({ title: 'Success', message: 'Information updated!', type: 'success' })
    } else {
      setShow(true)
      setMessage({ title: 'Error', message: 'Something went wrong :(', type: 'error' })
    }
    setSubmissionState(false)
  }

  return (
    !userContext || !userData ? (
      <LoadingScreen />
    ) : (
      <main>
        <div className='flex flex-col dark:text-black font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
          <HomeNavbar/>
          <div className='w-full h-full lg:my-auto md:my-auto mt-20 items-center'>
            <div className='lg:w-[62.5%] w-11/12 mx-auto flex justify-center'>
              <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message}
                     type={message.type}/>
            </div>
            <div
              className='flex lg:w-6/12 w-11/12 mx-auto bg-white/75 items-center flex-col border dark:border-indigo-600 border-2 border-orange-400 rounded-2xl'>
              <h1 className='text-xl m-3'>
                Notification Methods
              </h1>
              <div className='items-start space-y-5 m-5'>
                <div className='flex space-x-3 flex-row'>
                  <input
                    className='h-6 w-6'
                    checked={(notification.indexOf('TEXT') !== -1)}
                    value='TEXT'
                    onChange={() => handleClick('TEXT')}
                    type='checkbox'
                  />
                  <h3>
                    Text/SMS
                  </h3>
                </div>
                <div className='flex space-x-3 flex-row'>
                  <input
                    className='h-6 w-6'
                    checked={(notification.indexOf('EMAIL') !== -1)}
                    value='EMAIL'
                    onChange={() => handleClick('EMAIL')}
                    type='checkbox'
                  />
                  <h3>
                    Email
                  </h3>
                </div>
                <div className='flex space-x-3 flex-row'>
                  <input
                    className='h-6 w-6 shrink-0'
                    checked={(notification.indexOf('PUSH') !== -1)}
                    value='PUSH'
                    onChange={() => handleClick('PUSH')}
                    type='checkbox'
                  />
                  <h3>
                    Push Notifications (App Required)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => useSubmitNotifcation()}
                disabled={submissionState}
                className=' w-1/2 bg-orange-300 rounded-2xl hover:bg-orange-300 dark:bg-indigo-400 dark:hover:bg-indigo-500 disabled:opacity-50
                  disabled:cursor-not-allowed disabled:hover:bg-orange-300 disabled:dark:hover:bg-indigo-300 py-3 text-lg px-4 m-4'
              >
                {submissionState ? 'Submitting' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  )
}