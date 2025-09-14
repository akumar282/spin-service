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
  const [userContext, setUserContext] = useState<UserContext | null>(null)

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
          const info : UserContext = {
            sub: payload.sub,
            token: tokenCookie,
            username: payload['cognito:username']
          }
          setUserContext(info)
        }
      } catch {
        setUserContext(null)
      }
    }
  })

  return (
    <AuthWrapper>
      { children }
    </AuthWrapper>
  )
}