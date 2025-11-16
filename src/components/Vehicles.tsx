import React, { useEffect, useState } from 'react'
import { readAuth } from '../utils/auth'
import type { Vehicle } from '../types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

export default function Vehicles(): JSX.Element {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchVehicles, setSearchVehicles] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const auth = readAuth()
        if (!auth) throw new Error('No autorizado')
        const token = auth.token
        const res = await fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        const items = json.vehicles || json.data || json || []
        if (cancelled) return
        setVehicles((items as any[]).map((v: any) => ({
          id: v.id || v._id || String(v.id),
          plate: v.plate || v.licensePlate || v.matricula || null,
          brand: v.brand || v.make || null,
          model: v.model || null,
          status: v.status || 'active',
          driverId: v.driverId || v.assignedTo || null,
          createdAt: v.createdAt || v.created_at || null
        })))
      } catch (e: any) {
        setError(e?.message || 'Error cargando vehículos')
        setVehicles([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredVehicles = vehicles.filter(v => (
    (v.plate || '').toLowerCase().includes(searchVehicles.toLowerCase()) || (v.brand || '').toLowerCase().includes(searchVehicles.toLowerCase())
  ))

  return (
    <div className="vw-column vehicles-column">
      <div className="panel">
        <h3>Vehículos ({vehicles.length})</h3>
        <input placeholder="Buscar por placa o marca" value={searchVehicles} onChange={e => setSearchVehicles(e.target.value)} />
        <div className="list">
          {filteredVehicles.map(v => (
            <div key={v.id} className={`vw-item ${selectedVehicle === v.id ? 'active' : ''}`} onClick={() => setSelectedVehicle(selectedVehicle === v.id ? null : v.id)}>
              <div className="vw-item-head">
                <strong>{v.plate || 'Sin placa'}</strong>
                <span className="muted">{v.brand || ''} {v.model || ''}</span>
              </div>
              <div className="vw-item-sub muted">Estado: {v.status}</div>
              {selectedVehicle === v.id && (
                <div className="vw-item-details">
                  <div>Placa: {v.plate || '—'}</div>
                  <div>Marca: {v.brand || '—'}</div>
                  <div>Modelo: {v.model || '—'}</div>
                  <div>Conductor: {v.driverId || 'No asignado'}</div>
                  <div className="muted">Creado: {v.createdAt || '—'}</div>
                </div>
              )}
            </div>
          ))}
          {filteredVehicles.length === 0 && !loading && <p className="muted">No se encontraron vehículos.</p>}
        </div>
      </div>
    </div>
  )
}
