import React, { useContext, useEffect, useState } from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import { SpinClient } from '~/api/client'
import { AuthContext } from '~/components/AuthContext'
import { unwrap, type UpdateUser, type User } from '~/types'
import LoadingScreen from '~/components/LoadingScreen'

export function ChannelsComponent() {
  const userContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User['data']| null>(null)
  const [notification, setNotifications] = useState<string[]>([])

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
    const update = Object.assign({}, userData, { notifyType: notification })
    if (userContext && userContext.user?.data) {
      const data = unwrap(await client.patchData<UpdateUser>(`public/user/${userContext?.user?.sub}`, update))
      const result = await client.postData<string>('/public/refresh', { platform: 'web' })
      userContext.update()
    }
  }

  return (
    !userContext || !userData ? (
      <LoadingScreen />
    ) : (
      <main>
        <div className='flex flex-col dark:text-black font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
          <HomeNavbar/>
          <div className='w-full h-full lg:my-auto md:my-auto mt-20 items-center'>
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
              <button onClick={() => useSubmitNotifcation()} className='bg-orange-300 rounded-2xl dark:bg-indigo-300 py-3 text-lg px-4 m-4'>
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  )
}