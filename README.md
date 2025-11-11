# Frontend - Escaneo de Baches (Mockup)

Proyecto mockup en React + Vite (blanco y negro) para registrar baches localmente.

Prerequisitos
- Node.js >= 18

Instalación (PowerShell en Windows)

1. Abrir PowerShell en la carpeta `frontend`.
2. Instalar dependencias:

```
npm install
```

3. Ejecutar en modo desarrollo:

```
npm run dev
```

El servidor por defecto estará en http://localhost:3000

Qué contiene
- `src/` - código React: App, componentes (ReportForm, ReportList, MapPlaceholder) y `styles.css`.
- Datos guardados en `localStorage` bajo la clave `baches-reports`.

Siguientes pasos recomendados
- Integrar backend Node.js + PostgreSQL para persistencia.
- Añadir mapa real (Leaflet o Mapbox) y permitir geolocalización.
- Subida de fotos y validaciones.
