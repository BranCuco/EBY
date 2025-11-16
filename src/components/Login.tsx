import React, { useState } from 'react'
import type { Auth } from '../types'
import { writeAuth } from '../utils/auth'

type Props = {
  onLogin: (a: Auth) => void
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use the static logo file placed in public/icons (served at /icons/...)
  const logoData = '/icons/Eby.png'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!navigator.onLine) return setError('No hay conexión a internet')
    setError(null)
    setFieldErrors({})
    const errs: Record<string, string> = {}
    if (!username) errs.username = 'Usuario requerido'
    if (!password) errs.password = 'Contraseña requerida'
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000) // 7s timeout
    try {
      const res = await fetch('https://baches-yucatan-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
        signal: controller.signal
      })

      let data: any = null
      try { data = await res.json() } catch (_) { data = null }

      if (!res.ok) {
        // log full response for debugging (useful to inspect why some users fail)
        console.error('Login failed', { status: res.status, body: data })
        // Prefer a friendly message but include any server-provided message
        const serverMsg = data?.message || data?.error || (typeof data === 'string' ? data : null)
        return setError(serverMsg || `Error ${res.status}`)
      }

      const token = data?.token || data?.data?.token || data?.accessToken
      const userEmail = data?.user?.email || data?.data?.user?.email || username
      if (!token) {
        console.error('Login succeeded but token missing', { body: data })
        return setError('Token not returned from server')
      }
      const auth: Auth = { token, user: userEmail }
      writeAuth(auth)
      onLogin(auth)
    } catch (err: any) {
      if (err.name === 'AbortError') setError('La petición tardó demasiado. Intente de nuevo.')
      else setError('Error de conexión')
      console.error('Login error:', err)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  // Registration removed: component only handles login

  return (
    <div className="auth-page">
      <div className="auth-card">
          <div className="auth-header">
            <img src={logoData} alt="logo" className="auth-logo" />
            <h3>Inicie sesión para continuar</h3>
          </div>

          <div className="auth-body">
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <input className="input" placeholder="Email" value={username} onChange={e => setUsername(e.target.value)} autoFocus disabled={loading} />
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}

              <div className="password-row">
                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                <button type="button" className="small show-btn" onClick={() => setShowPassword(s => !s)} disabled={loading}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
              </div>
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

              <label className="checkbox"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} disabled={loading} /> Recuerdame</label>

              <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar sesión'}</button>

            </form>
          </div>
      </div>
    </div>
  )
}
