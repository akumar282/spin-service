import React, { createContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

export type UserContext = {
  sub: string
  token: string
  username: string
  new_user?: boolean
}

export const AuthContext = createContext<UserContext | null>(null)

interface WrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: WrapperProps) {
  const [token, setToken] = useState<string | null>(null)
  const [sub, setSub] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const verifier = CognitoJwtVerifier.create({
    userPoolId: import.meta.env.USER_POOL_ID as string,
    tokenUse: 'id',
    clientId: import.meta.env.CLIENT_ID as string,
  })

  useEffect(() => {
    const tokenCookie = Cookies.get('idToken')
    if (tokenCookie) {
      try {
        const verifyParseToken = async () => {
          const payload = await verifier.verify(tokenCookie)
          setSub(payload.sub)
          setToken(tokenCookie)
          setUsername(payload['cognito:username'])
        }
      } catch {
        setToken(null)
        setSub(null)
        setUsername(null)
      }
    }
  })

  return (
    <AuthWrapper>
      { children }
    </AuthWrapper>
  )
}