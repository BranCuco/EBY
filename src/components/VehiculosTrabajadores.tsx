import React, { useEffect, useState } from 'react'
import { readAuth } from '../utils/auth'
import type { Worker, Vehicle } from '../types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

export default function VehiculosTrabajadores(): JSX.Element {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [searchWorkers, setSearchWorkers] = useState<string>('')
  const [searchVehicles, setSearchVehicles] = useState<string>('')

  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const auth = readAuth()
        if (!auth) throw new Error('No autorizado')
        const token = auth.token

        const [wRes, vRes] = await Promise.all([
          fetch(`${API_BASE}/workers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        const wJson = await wRes.json()
        const vJson = await vRes.json()

        const wItems = wJson.workers || wJson.data || wJson || []
        const vItems = vJson.vehicles || vJson.data || vJson || []

        setWorkers((wItems as any[]).map((w: any) => ({
          id: w.id || w._id || String(w.id),
          name: w.name || w.fullname || w.username || 'Sin nombre',
          role: w.role || w.position || 'trabajador',
          email: w.email || null,
          phone: w.phone || null,
          assignedVehicleId: w.assignedVehicleId || w.vehicleId || null,
          createdAt: w.createdAt || w.created_at || null
        })))

        setVehicles((vItems as any[]).map((v: any) => ({
          id: v.id || v._id || String(v.id),
          plate: v.plate || v.licensePlate || v.matricula || null,
          brand: v.brand || v.make || null,
          model: v.model || null,
          status: v.status || 'active',
          driverId: v.driverId || v.assignedTo || null,
          createdAt: v.createdAt || v.created_at || null
        })))

      } catch (e: any) {
        setError(e?.message || 'Error cargando datos')
        setWorkers([])
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredWorkers = workers.filter(w => (
    w.name.toLowerCase().includes(searchWorkers.toLowerCase()) || (w.email || '').toLowerCase().includes(searchWorkers.toLowerCase())
  ))

  const filteredVehicles = vehicles.filter(v => (
    (v.plate || '').toLowerCase().includes(searchVehicles.toLowerCase()) || (v.brand || '').toLowerCase().includes(searchVehicles.toLowerCase())
  ))

  return (
    <div className="page vw-grid">
      <h2>Vehículos y trabajadores</h2>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="vw-columns">
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
      </div>
    </div>
  )
}
