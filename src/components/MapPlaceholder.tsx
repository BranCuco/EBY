import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Report, Location } from '../types'

// Fix default icon paths for leaflet when used with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function LocationSelector({ onSelect }: { onSelect: (loc: Location) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

type Props = {
  reports?: Report[]
  selected?: Location | null
  onSelect?: (loc: Location | null) => void
}

export default function MapPlaceholder({ reports = [], selected, onSelect }: Props) {
  const center = selected ? [selected.lat, selected.lng] : [20.9674, -89.5926] // Yucatán approx

  useEffect(() => {
    // no-op: placeholder for future side effects
  }, [])

  return (
    <div className="map-placeholder">
      <MapContainer center={center as [number, number]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector onSelect={(loc) => onSelect && onSelect(loc)} />

        {reports.map(r => r.location && (
          <Marker key={r.id} position={[r.location.lat, r.location.lng]} />
        ))}
        {selected && <Marker position={[selected.lat, selected.lng]} />}
      </MapContainer>
      <p className="map-note">Haga click en el mapa para seleccionar la ubicación del reporte.</p>
    </div>
  )
}
