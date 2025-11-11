import React, { useState, useEffect } from 'react'
import MapPlaceholder from './MapPlaceholder'
import { readAuth } from '../utils/auth'
import type { Location } from '../types'
import type { Report } from '../types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type Props = {
  onCreated?: (created: any) => void
}

export default function TestCreateReport({ onCreated }: Props): JSX.Element {
  const [description, setDescription] = useState<string>('')
  const [severity, setSeverity] = useState<string>('medium')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
    const [createdReport, setCreatedReport] = useState<any | null>(null)
    const [geocodingLoading, setGeocodingLoading] = useState<boolean>(false)
    
  const [street, setStreet] = useState<string>('')
  const [neighborhood, setNeighborhood] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [stateName, setStateName] = useState<string>('Yucatán')
  const [postalCode, setPostalCode] = useState<string>('')
  const [comments, setComments] = useState<string>('')
  const [status, setStatus] = useState<string>('reported')
  // date is set automatically when publishing

  // When the selectedLocation changes, reverse-geocode to fill address fields
  useEffect(() => {
    if (!selectedLocation) return
    const { lat, lng } = selectedLocation
    let cancelled = false
    async function rev() {
      try {
        setGeocodingLoading(true)
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        const res = await fetch(url, { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error('Geocoding error')
        const data = await res.json()
        if (cancelled) return
        const addr = data.address || {}
        setStreet(addr.road || addr.pedestrian || addr.cycleway || addr.footway || '')
        setNeighborhood(addr.neighbourhood || addr.suburb || addr.village || addr.town || '')
        setCity(addr.city || addr.town || addr.village || addr.hamlet || '')
        setStateName(addr.state || stateName || '')
        setPostalCode(addr.postcode || '')
      } catch (e) {
        console.warn('Reverse geocode failed', e)
      } finally {
        setGeocodingLoading(false)
      }
    }
    rev()
    return () => { cancelled = true }
  }, [selectedLocation])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  setMessage(null)
  setLoading(true)
    try {
      const auth = readAuth()
      if (!auth) throw new Error('No autorizado')

      let imageData: string | null = null
      if (photoFile) {
        imageData = await fileToBase64(photoFile)
      }
      // validate required fields expected by the API
      if (!selectedLocation) throw new Error('Seleccione la ubicación en el mapa')

  // set publish date automatically to now (ISO)
  const isoDate = new Date().toISOString()

      const payload: any = {
        description,
        // server expects lowercase enum values: 'low' | 'medium' | 'high'
        severity: String(severity).toLowerCase(),
        date: isoDate,
        status,
        comments
      }

  // location/address fields expected by the API
  payload.latitude = selectedLocation.lat
  payload.longitude = selectedLocation.lng
  payload.street = street || undefined
  payload.neighborhood = neighborhood || undefined
  payload.city = city || undefined
  payload.state = stateName || undefined
  payload.postalCode = postalCode || undefined
  // Avoid sending nested `location` object which may conflict with top-level lat/lng on the server

  // include images array (server often expects an array even if empty)
  payload.images = imageData ? [imageData] : []

  // send payload (no debug logging)

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        // Try to parse JSON body for structured error information
        let body: any = null
        try {
          body = await res.clone().json()
        } catch (e) {
          try { body = await res.clone().text() } catch (_) { body = null }
        }
        const serverMsg = body && (body.message || body.error || JSON.stringify(body))
        setMessage(`Error ${res.status}: ${serverMsg || res.statusText}`)
        setCreatedReport(body)
        return
      }

      const created = await res.json().catch(() => null)

    setMessage('Reporte creado correctamente')
    setCreatedReport(created)
      setDescription('')
      setSeverity('medium')
      setPhotoFile(null)
  setSelectedLocation(null)
  if (onCreated) onCreated(created)
    } catch (err: any) {
      setMessage(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="page create-report-page">
      <h2>Crear reporte (sección de prueba)</h2>
      <form className="create-report-form" onSubmit={handleSubmit}>
          <label>Descripción
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe el bache..." required></textarea>
          </label>

          <label>Severidad
            <select value={severity} onChange={e => setSeverity(e.target.value)}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>

          <label>Foto
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
          </label>

          <fieldset style={{marginTop:8,padding:8,border:'1px solid #eee'}}>
            <legend>Dirección (opcional)</legend>
            <label> Calle
              <input value={street} onChange={e => setStreet(e.target.value)} placeholder="Calle 42" />
            </label>
            <label> Colonia
              <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Centro" />
            </label>
            <label> Ciudad
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Tixpéhual" />
            </label>
            <label> Estado
              <input value={stateName} onChange={e => setStateName(e.target.value)} placeholder="Yucatán" />
            </label>
            <label> Código postal
              <input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="97370" />
            </label>
          </fieldset>

          <label>Comentarios (opcional)
            <input value={comments} onChange={e => setComments(e.target.value)} placeholder="Urgente por cercanía a zona escolar" />
          </label>

              {/* Fecha y hora se asignan automáticamente al publicar */}

        <div style={{marginTop:8}}>
          <small>Selecciona la ubicación haciendo click en el mapa:</small>
        </div>

        <div style={{marginTop:8}}>
          <MapPlaceholder reports={[]} selected={selectedLocation} onSelect={loc => setSelectedLocation(loc)} />
        </div>

        <div className="form-actions" style={{marginTop:10}}>
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Creando...' : 'Crear reporte'}</button>
        </div>

        {message && <p className="muted" style={{marginTop:8}}>{message}</p>}
        {createdReport && (
          <div className="success-box" style={{marginTop:8,border:'1px solid #d1e7dd',background:'#e9f7ef',padding:8}}>
            <strong>ID:</strong> {createdReport.id || createdReport._id || '—'}
            <div style={{marginTop:6}}><small>Respuesta del servidor:</small>
              <pre style={{whiteSpace:'pre-wrap',fontSize:'0.85rem'}}>{JSON.stringify(createdReport,null,2)}</pre>
            </div>
          </div>
        )}
        
      </form>
    </div>
  )
}

