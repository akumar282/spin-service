import React, { createContext, type Dispatch, type SetStateAction, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { SpinClient } from '~/api/client'
import type { SessionResponse, User } from '~/types'

export type UserContext = {
  sub: string
  token: string
  username: string
  new_user?: boolean
}

export type AuthContextType = {
  user: UserContext | null
  setUser: Dispatch<SetStateAction<UserContext | null>>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface WrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: WrapperProps) {
  const [userContext, setUserContext] = useState<UserContext | null>(null)

  const verifier = CognitoJwtVerifier.create({
    userPoolId: import.meta.env.VITE_USER_POOL_ID as string,
    tokenUse: 'id',
    clientId: import.meta.env.VITE_CLIENT_ID as string,
  })

  const client = new SpinClient()

  useEffect(() => {
    const verifySession = async () => {
      const data = await client.getData<SessionResponse>('public/session')
      const decode = atob(data.token)
      const payload = await verifier.verify(decode)
      const info : UserContext = {
        sub: payload.sub,
        token: decode,
        username: payload['cognito:username']
      }
      localStorage.setItem('id', decode)
      setUserContext(info)
    }

    verifySession().catch()
  }, [])

  return (
    <AuthContext.Provider value={{ user: userContext, setUser: setUserContext }}>
      { children }
    </AuthContext.Provider>
  )
}