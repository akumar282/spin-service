import AuthWrapper from '~/components/AuthContext'
import { Outlet } from 'react-router'
import React from 'react'

export default function AppLayout() {
  return (
    <AuthWrapper>
      <Outlet/>
    </AuthWrapper>
  )
}