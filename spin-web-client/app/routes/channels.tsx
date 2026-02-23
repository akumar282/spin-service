import type { Route } from './+types/home'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '~/components/AuthContext'
import { type User } from '~/types'
import { SpinClient } from '~/api/client'
import LoadingScreen from '~/components/LoadingScreen'
import HomeNavbar from '~/components/HomeNavbar'
import { updateUser } from '~/functions'
import Alert from '~/components/Alert'
import { useNavigate } from 'react-router'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'channels | spin-service' },
    { name: 'spin service notification types', content: 'set how you want to be notified' },
  ]
}

export default function Channels() {
  const userContext = useContext(AuthContext)
  const navigate = useNavigate()
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [notification, setNotifications] = useState<string[]>([])
  const [submissionState, setSubmissionState] = useState<boolean>(false)
  const [prevOptOut, setPrevOptOut] = useState<boolean>(false)
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
        setPrevOptOut(!!data.prevOptedOut)
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
            {
              prevOptOut ? (
                <div className='lg:w-[62.5%] w-11/12 mx-auto flex justify-center'>
                  <div className={'flex items-center text-center p-4 mb-4 lg:w-8/10 w-[97%] text-sm border  text-yellow-800 border-yellow-400 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300'} role='alert'>
                    <svg className='flex-shrink-0 inline w-4 h-4 mr-3' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z' />
                    </svg>
                    <span className='sr-only'>Info</span>
                    <div>
                      <span className='font-medium'>NOTE:</span>
                      <span className='font-medium mx-1'></span>Not getting SMS alerts? You may have opted out by text. To turn them back on, text START to +1-440-737-2110.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                </>
              )
            }
            <div
              className='flex lg:w-6/12 w-11/12 mx-auto bg-white/75 items-center flex-col dark:border-indigo-600 border-2 border-orange-400 rounded-2xl'>
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
                    Text/SMS (Message and data rates may apply)
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
                <div className='text-sm text-center'>
                  By enabling SMS/Text alerts you consent to the
                  <a
                    onClick={() => navigate('/privacy')}
                    className='underline text-secondary-blue ml-2 hover:text-indigo-400 cursor-pointer'>
                    Privacy Policy
                  </a> and can opt out anytime through this console or replying STOP
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