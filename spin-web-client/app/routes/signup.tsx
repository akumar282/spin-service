import type { Route } from './+types/home'
import { SignUpComponent } from '~/modules/auth/signup'
import React from 'react'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'spin-service' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function SignUp() {
  return <SignUpComponent />
}
