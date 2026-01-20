import type { Route } from './+types/home'
import React, { useContext, useEffect, useState } from 'react'
import HomeNavbar from '~/components/HomeNavbar'
import { SpinClient } from '~/api/client'
import { AuthContext } from '~/components/AuthContext'
import { type User } from '~/types'
import LoadingScreen from '~/components/LoadingScreen'
import { useFormik } from 'formik'
import { updateUser } from '~/functions'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'user | spin-service' }
  ]
}

export default function User() {
  const userContext = useContext(AuthContext)
  const [userData, setUserData] = useState<User['data']| null>(null)

  const client = new SpinClient()
  useEffect(() => {
    if (!userContext?.user?.sub) return
    const fetchUser = async () => {
      if (userContext?.user?.data) {
        const data = userContext.user.data
        setUserData(data)
      }
    }

    fetchUser().catch()
  }, [userContext])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: userData?.email,
      phone: userData?.phone,
    },
    onSubmit: async (values) => {
      const update = Object.assign({}, userData, values)
      await updateUser(userContext, client, update)
    }
  })

  return (
    !userContext || !userData ? (
      <LoadingScreen />
    ) : (
      <main>
        <div className='flex flex-col dark:text-black font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen'>
          <HomeNavbar />
          <div className='w-full h-full lg:my-auto md:my-auto mt-10 items-center'>
            <div className='flex lg:w-6/12 w-10/12 mx-auto bg-white/75 items-center flex-col border dark:border-indigo-600 border-2 border-orange-400 rounded-2xl'>
              <h1 className='text-xl m-3'>User Information</h1>
              <form onSubmit={formik.handleSubmit} className='w-full flex flex-col items-center'>
                <div className='w-10/12 space-y-4 m-5'>
                  <div className='flex space-y-2 flex-col-reverse'>
                    <input
                      className='bg-white my-2 text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
                      type='text'
                      name='email'
                      id='email'
                      placeholder={userData.email}
                      value={formik.values.email || ''}
                      onChange={formik.handleChange}
                    />
                    <h3>Email Address</h3>
                  </div>
                  <div className='flex space-y-2 flex-col-reverse'>
                    <input
                      className='bg-white my-2 text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
                      type='text'
                      name='phone'
                      id='phone'
                      placeholder={userData.phone}
                      value={formik.values.phone || ''}
                      onChange={formik.handleChange}
                    />
                    <h3>Phone</h3>
                  </div>
                </div>
                <button
                  className='bg-orange-300 rounded-2xl dark:bg-indigo-300 py-3 text-lg px-4 m-4'
                  type='submit'
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    )
  )
}