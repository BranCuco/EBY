import React from 'react'

type Props = {
  user: string
  email: string
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Sidebar({ user, email, currentPage, onNavigate }: Props) {
  const avatar = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#0b4661" rx="4" />
      <circle cx="12" cy="9" r="3" fill="#fff"/>
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#fff" opacity="0.9"/>
    </svg>
  `)

  return (
    <aside className="sidebar">
      <div className="profile">
        <img src={avatar} alt="avatar" className="profile-avatar" />
        <div className="profile-name">{user}</div>
        <div className="profile-email">{email}</div>
      </div>

      <nav className="nav">
        <button className={`nav-item ${currentPage === 'reportes' ? 'active' : ''}`} onClick={() => onNavigate('reportes')}>Reportes</button>
        <button className={`nav-item ${currentPage === 'crear' ? 'active' : ''}`} onClick={() => onNavigate('crear')}>Crear reporte (prueba)</button>
        <button className={`nav-item ${currentPage === 'vehiculos' ? 'active' : ''}`} onClick={() => onNavigate('vehiculos')}>Vehículos y trabajadores</button>
      </nav>
    </aside>
  )
}
