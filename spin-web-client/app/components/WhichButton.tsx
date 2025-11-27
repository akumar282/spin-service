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
        <button className='dark:bg-indigo-700 bg-orange-500 py-1.5 px-4 rounded-xl text-lg text-white' onClick={() => navigate('/login')}>
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