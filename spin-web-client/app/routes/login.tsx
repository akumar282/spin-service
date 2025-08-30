import type { Route } from './+types/home'
import { LoginComponent } from '~/modules/auth/login'
import React from 'react'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Login() {
  return <LoginComponent />
}
