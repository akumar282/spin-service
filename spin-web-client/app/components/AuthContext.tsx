import React, {createContext, type Dispatch, type SetStateAction, useEffect, useState} from 'react'
import Cookies from 'js-cookie'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

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

  useEffect(() => {
    const verifyParseToken = async (token: string) => {
      const payload = await verifier.verify(token)
      const info : UserContext = {
        sub: payload.sub,
        token: token,
        username: payload['cognito:username']
      }
      setUserContext(info)
    }

    const tokenCookie = Cookies.get('idToken')
    if (tokenCookie) {
      try {
        verifyParseToken(tokenCookie).catch()
      } catch {
        setUserContext(null)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user: userContext, setUser: setUserContext }}>
      { children }
    </AuthContext.Provider>
  )
}