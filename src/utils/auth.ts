import type { Auth } from '../types'

export const AUTH_KEY = 'baches-auth'

export function readAuth(): Auth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) as Auth : null
  } catch {
    return null
  }
}

export function writeAuth(auth: Auth): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}
