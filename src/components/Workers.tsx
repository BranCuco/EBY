import React, { useEffect, useState } from 'react'
import { readAuth } from '../utils/auth'
import type { Worker } from '../types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

export default function Workers(): JSX.Element {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchWorkers, setSearchWorkers] = useState<string>('')
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const auth = readAuth()
        if (!auth) throw new Error('No autorizado')
        const token = auth.token
        const res = await fetch(`${API_BASE}/workers`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        const items = json.workers || json.data || json || []
        if (cancelled) return
        setWorkers((items as any[]).map((w: any) => ({
          id: w.id || w._id || String(w.id),
          name: w.name || w.fullname || w.username || 'Sin nombre',
          role: w.role || w.position || 'trabajador',
          email: w.email || null,
          phone: w.phone || null,
          assignedVehicleId: w.assignedVehicleId || w.vehicleId || null,
          createdAt: w.createdAt || w.created_at || null
        })))
      } catch (e: any) {
        setError(e?.message || 'Error cargando trabajadores')
        setWorkers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredWorkers = workers.filter(w => (
    w.name.toLowerCase().includes(searchWorkers.toLowerCase()) || (w.email || '').toLowerCase().includes(searchWorkers.toLowerCase())
  ))

  return (
    <div className="vw-column workers-column">
      <div className="panel">
        <h3>Trabajadores ({workers.length})</h3>
        <input placeholder="Buscar trabajadores por nombre o email" value={searchWorkers} onChange={e => setSearchWorkers(e.target.value)} />
        <div className="list">
          {filteredWorkers.map(w => (
            <div key={w.id} className={`vw-item ${selectedWorker === w.id ? 'active' : ''}`} onClick={() => setSelectedWorker(selectedWorker === w.id ? null : w.id)}>
              <div className="vw-item-head">
                <strong>{w.name}</strong>
                <span className="muted">{w.role}</span>
              </div>
              <div className="vw-item-sub muted">{w.email || '—'} · {w.phone || '—'}</div>
              {selectedWorker === w.id && (
                <div className="vw-item-details">
                  <div>Email: {w.email || '—'}</div>
                  <div>Tel: {w.phone || '—'}</div>
                  <div>Asignado: {w.assignedVehicleId || 'Ninguno'}</div>
                  <div className="muted">Creado: {w.createdAt || '—'}</div>
                </div>
              )}
            </div>
          ))}
          {filteredWorkers.length === 0 && !loading && <p className="muted">No se encontraron trabajadores.</p>}
        </div>
      </div>
    </div>
  )
}
