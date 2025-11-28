import React, { useContext } from 'react'
import { AuthContext } from '~/components/AuthContext'
import logoutimg from '~/assets/logout.svg'
import { useNavigate } from 'react-router'

export default function WhichButton() {
  const context = useContext(AuthContext)
  const navigate = useNavigate()

  const user = context.user

  if (!user) {
    return (
      <>
        <button className='bg-gradient-to-r hover:bg-gradient-to-b dark:from-indigo-700 dark:to-indigo-500 from-orange-500 to-orange-400 dark:shadow-md dark:shadow-indigo-600 shadow-lg shadow-orange-300 py-1.5 px-4 rounded-xl text-lg text-white' onClick={() => navigate('/login')}>
          Log In
        </button>
      </>
    )
  }


  return (
    <>
      <button onClick={() => context.logOut()}>
        <img height={30} width={30} src={logoutimg} alt={'logout image'}/>
      </button>
    </>
  )
}