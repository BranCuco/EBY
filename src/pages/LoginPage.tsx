import React from 'react'
import Login from '../components/Login'
import type { Auth } from '../types'

type Props = {
  onLogin?: (a: Auth) => void
}

export default function LoginPage({ onLogin }: Props) {
  return <Login onLogin={(onLogin as any) || (() => {})} />
}
