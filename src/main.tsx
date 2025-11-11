import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './service-worker.js'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)

// Register service worker for PWA when supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/service-worker.js')
      .then((reg) => console.log('Service worker registered.', reg.scope))
      .catch((err) => console.warn('Service worker registration failed:', err));
  })
}
