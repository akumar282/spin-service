import React, { createContext, type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { SpinClient } from '~/api/client'
import { type SessionResponse, unwrap, type User } from '~/types'
import { useNavigate } from 'react-router'

export type UserContext = {
  sub: string
  token: string
  username: string
  data: User['data']
  new_user?: boolean
}

export type AuthContextType = {
  user: UserContext | null
  setUser: Dispatch<SetStateAction<UserContext | null>>
  update: () => void
  logOut: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface WrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: WrapperProps) {
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const navigate = useNavigate()
  const verifier = CognitoJwtVerifier.create({
    userPoolId: import.meta.env.VITE_USER_POOL_ID as string,
    tokenUse: 'id',
    clientId: import.meta.env.VITE_CLIENT_ID as string,
  })

  const client = new SpinClient()

  useEffect(() => {
    const verifySession = async () => {
      await updateContext()
    }

    verifySession().catch()
  }, [])

  async function updateContext() {
    const data = await client.getData<SessionResponse>('public/session')
    if (data.status === 200) {
      const decode = atob(data.data.token)
      const payload = await verifier.verify(decode)
      localStorage.setItem('id', decode)
      const userData = unwrap(await client.getData<User>(`public/user/${payload.sub}`))
      const info : UserContext = {
        sub: payload.sub,
        token: decode,
        username: payload['cognito:username'],
        data: userData.data
      }
      setUserContext(info)
    } else {
      localStorage.clear()
      navigate('/login')
    }
  }

  function logOut() {
    localStorage.clear()
    // Session Endpoint
  }

  return (
    <AuthContext.Provider value={{ user: userContext, setUser: setUserContext, update: updateContext, logOut: logOut }}>
      { children }
    </AuthContext.Provider>
  )
}