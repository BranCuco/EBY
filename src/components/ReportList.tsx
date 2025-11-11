import React, { useState } from 'react'
import type { Report } from '../types'

type DetailedReport = Report & {
  status?: string
  comments?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
  postalCode?: string
  images?: string[]
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch (e) {
    return iso
  }
}

type Props = {
  reports: DetailedReport[]
  onDelete?: (id: string) => Promise<void>
}

export default function ReportList({ reports, onDelete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date_desc')

  // helper to rank severity for sorting
  const severityRank = (s?: string) => {
    const norm = normalizeSeverity(s)
    if (norm === 'low') return 1
    if (norm === 'medium') return 2
    if (norm === 'high') return 3
    return 2
  }

  // normalize different possible server values (case, language) to 'low'|'medium'|'high' or null
  function normalizeSeverity(raw?: string): 'low' | 'medium' | 'high' | null {
    if (!raw) return null
    const v = String(raw).trim().toLowerCase()
    // English
    if (v === 'low' || v === 'l') return 'low'
    if (v === 'medium' || v === 'med' || v === 'm') return 'medium'
    if (v === 'high' || v === 'h') return 'high'
    // Spanish
    if (v === 'baja' || v === 'b' || v === 'bajo') return 'low'
    if (v === 'media' || v === 'media' || v === 'm') return 'medium'
    if (v === 'alta' || v === 'a' || v === 'alto') return 'high'
    // fallback: check contains
    if (v.includes('low') || v.includes('baj')) return 'low'
    if (v.includes('med')) return 'medium'
    if (v.includes('high') || v.includes('alt')) return 'high'
    return null
  }

  const filtered = reports.filter(r => {
    if (filterSeverity === 'all') return true
    // prefer explicit severity first; some records use `status` for workflow state
    const candidate = r.severity || r.status || ''
    const norm = normalizeSeverity(candidate)
    return norm === filterSeverity
  })

  const displayed = filtered.slice().sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'alpha_asc':
        return String(a.description || '').localeCompare(String(b.description || ''))
      case 'alpha_desc':
        return String(b.description || '').localeCompare(String(a.description || ''))
      case 'severity_asc':
        return severityRank(a.severity) - severityRank(b.severity)
      case 'severity_desc':
        return severityRank(b.severity) - severityRank(a.severity)
      default:
        return 0
    }
  })

  return (
    <div className="report-list">
      <h2>Reportes ({reports.length})</h2>
      <div className="report-controls" style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <label style={{display:'flex',alignItems:'center',gap:6}}>
          <small>Filtrar:</small>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            <option value="all">Todos</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <label style={{display:'flex',alignItems:'center',gap:6}}>
          <small>Orden:</small>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date_desc">Fecha (más recientes)</option>
            <option value="date_asc">Fecha (más antiguos)</option>
            <option value="alpha_asc">A → Z (descripción)</option>
            <option value="alpha_desc">Z → A (descripción)</option>
            <option value="severity_desc">Severidad (Alta → Baja)</option>
            <option value="severity_asc">Severidad (Baja → Alta)</option>
          </select>
        </label>
      </div>
      {reports.length === 0 && <p>No hay reportes aún.</p>}
      <ul>
  {displayed.map((r) => (
          <li key={r.id} className={`report-item ${r.severity}`}>
            <div className="meta">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <strong>{r.severity.toUpperCase()}</strong>
                <span className={`status-badge ${r.status || ''}`}>{(r.status || '').toUpperCase() || '—'}</span>
              </div>
              <time>{formatDate(r.createdAt)}</time>
            </div>

            <p className="desc">{r.description}</p>

            {r.comments && <div className="comments"><strong>Comentarios:</strong> {r.comments}</div>}

            {(r.street || r.neighborhood || r.city || r.state || r.postalCode) && (
              <div className="address" style={{marginTop:8}}>
                <strong>Dirección:</strong>
                <div>{r.street || ''}{r.street && r.neighborhood ? ', ' : ''}{r.neighborhood || ''}</div>
                <div>{r.city || ''}{r.city && r.state ? ', ' : ''}{r.state || ''} {r.postalCode || ''}</div>
              </div>
            )}

            {r.location && (
              <div className="location">Ubicación: {r.location.lat}, {r.location.lng}</div>
            )}

            {r.images && r.images.length > 0 && (
              <div className="image-row" style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
                {r.images.map((img, idx) => (
                  <div key={idx} className="photo-thumb" style={{cursor:'pointer'}}>
                    <img src={img} alt={`foto-${idx}`} onClick={() => setPreview(img || null)} />
                  </div>
                ))}
              </div>
            )}

            {onDelete && (
              <div style={{marginTop:8}}>
                <button className="small" onClick={async () => {
                  if (!confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return
                  try {
                    await onDelete(r.id)
                  } catch (e) {
                    console.error('Eliminar reporte falló', e)
                    alert('No se pudo eliminar el reporte')
                  }
                }}>Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {preview && (
        <div className="image-modal" onClick={() => setPreview(null)}>
          <img src={preview} alt="preview large" />
        </div>
      )}
    </div>
  )
}
