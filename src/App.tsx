import React, { useEffect, useState } from 'react'
import ReportList from './components/ReportList'
import MapPlaceholder from './components/MapPlaceholder'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import VehiculosTrabajadores from './components/VehiculosTrabajadores'
import TestCreateReport from './components/TestCreateReport'
import { readAuth, clearAuth } from './utils/auth'
import type { Report, Location as Loc, Auth } from './types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

export default function App(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Loc | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)

  // Leer auth al montar
  useEffect(() => {
    try {
      const a = readAuth()
      if (a) setAuth(a)
    } catch (e) {
      console.warn('Error reading auth', e)
    }
  }, [])

  // Carga de reportes desde la API (extraída para poder llamarla desde otras partes)
  const loadReports = React.useCallback(async () => {
    if (!auth) {
      setReports([])
      return
    }
    try {
      const token = auth!.token
      const res = await fetch(`${API_BASE}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const items = data.reports || data.data || data || []
      const normalized = (items as any[]).map(r => ({
        id: r.id,
        description: r.description || r.comments || '',
        severity: r.severity || 'medium',
        status: r.status || 'reported',
        comments: r.comments || '',
        street: r.street || '',
        neighborhood: r.neighborhood || '',
        city: r.city || '',
        state: r.state || r.stateName || '',
        postalCode: r.postalCode || r.postal_code || '',
        location: r.location ? r.location : (r.latitude !== undefined && r.longitude !== undefined ? { lat: r.latitude, lng: r.longitude } : null),
        images: Array.isArray(r.images) ? r.images : (r.photo ? [r.photo] : []),
        createdAt: r.createdAt || r.date || new Date().toISOString()
      }))
      setReports(normalized)
    } catch (e) {
      console.error('Error loading reports from API', e)
      setReports([])
    }
  }, [auth])

  useEffect(() => {
    loadReports()
  }, [auth, loadReports])

  // report creation removed: dashboard is read-only and reads from API

  // allow deleting reports (requires auth)
  async function deleteReport(id: string) {
    if (!auth) throw new Error('No autorizado')
    try {
      const token = auth.token
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const body = await res.text().catch(() => null)
        throw new Error(body || `Error ${res.status}`)
      }
      // refresh list
      await loadReports()
    } catch (e) {
      console.error('Error deleting report', e)
      throw e
    }
  }

  function setLocation(loc: Loc | null) {
    setSelectedLocation(loc)
  }

  function handleLogin(a: Auth) {
    setAuth(a)
  }

  function handleLogout() {
    clearAuth()
    setAuth(null)
  }

  // removal disabled in dashboard (read-only)

  const [currentPage, setCurrentPage] = useState<string>('reportes')

  function navigate(page: string) {
    setCurrentPage(page)
  }

  if (!auth) return <div className="app-root"><Login onLogin={handleLogin} /></div>

  const displayEmail = auth.user && auth.user.includes('@') ? auth.user : `${auth.user}@example.com`
  const displayName = auth.user && auth.user.includes('@') ? auth.user.split('@')[0] : auth.user

  return (
    <div className="app-root app-with-sidebar">
      <header>
        <h1>Registro de Baches — Mockup (React + Vite)</h1>
        <div className="auth-area">Usuario: <strong>{auth.user}</strong> <button onClick={handleLogout}>Salir</button></div>
      </header>

      <div className="workspace">
        <Sidebar user={displayName} email={displayEmail} currentPage={currentPage} onNavigate={navigate} />

        <main>
          {currentPage === 'reportes' && (
            <div className="content">
              {/* removed Reload button per UX request; only the list is shown */}
              <div className="report-section">
                {/* Dashboard is read-only: reports come from the database via API */}
                <div className="report-list-column">
                  <ReportList reports={reports} onDelete={deleteReport} />
                </div>
                <div className="report-map-column">
                  <MapPlaceholder reports={reports} selected={selectedLocation} onSelect={setLocation} />
                </div>
              </div>
            </div>
          )}

          {currentPage === 'crear' && (
            <div className="create-page">
              <TestCreateReport onCreated={(created) => { loadReports(); setCurrentPage('reportes') }} />
            </div>
          )}

          {currentPage === 'vehiculos' && (
            <div className="vehiculos-page">
              <VehiculosTrabajadores />
            </div>
          )}
        </main>
      </div>

    
    </div>
  )
}
