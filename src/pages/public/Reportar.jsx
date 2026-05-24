import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavBarPublica from '../../components/layout/NavBarPublica'
import { Button } from '../../components/ui'

export default function Reportar() {
  const [ubicacion, setUbicacion] = useState('')
  const [estadoGPS, setEstadoGPS] = useState('idle') // idle | buscando | ok | error
  const [iframeSrc, setIframeSrc] = useState(
    'https://tally.so/embed/2EP2ke?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'
  )

  const BASE_TALLY = 'https://tally.so/embed/2EP2ke?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

  function recargarIframe(valor) {
    setIframeSrc(`${BASE_TALLY}&coordenadas=${encodeURIComponent(valor)}`)
  }

  function obtenerGPS() {
    if (!navigator.geolocation) {
      alert('GPS no disponible en este dispositivo.')
      return
    }
    setEstadoGPS('buscando')

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords
        const link = `http://maps.google.com/?q=${lat},${lng}`
        setUbicacion(`📍 GPS detectado (±${Math.round(acc)}m)`)
        setEstadoGPS('ok')
        recargarIframe(link)
        if (acc > 1000) alert(`Aviso: ubicación aproximada (error: ${Math.round(acc)}m).`)
      },
      () => {
        setEstadoGPS('error')
        alert('No se pudo obtener la ubicación. Activa el GPS e inténtalo de nuevo.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const btnGPSClase = {
    idle:     'bg-blue-600 hover:bg-blue-700 text-white',
    buscando: 'bg-blue-400 cursor-wait text-white',
    ok:       'bg-green-600 text-white cursor-default',
    error:    'bg-red-500 hover:bg-red-600 text-white',
  }[estadoGPS]

  const btnGPSTexto = {
    idle:     '📍 Usar GPS',
    buscando: '⏳ Buscando...',
    ok:       '✅ GPS OK',
    error:    '⚠️ Reintentar',
  }[estadoGPS]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBarPublica />

      <header className="bg-pc-orange text-white py-8 text-center shadow-md">
        <h2 className="text-3xl font-bold mb-1">📸 Reporte Ciudadano</h2>
        <p className="text-orange-100 text-sm">Indica la ubicación y describe la incidencia.</p>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-pc border border-gray-100 p-6 md:p-8">

          {/* Selector de ubicación */}
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <label className="flex justify-between items-center text-sm font-bold text-blue-900 mb-3">
              <span>📍 Ubicación de la incidencia</span>
              <button
                onClick={() => alert('💡 Activa el WiFi aunque no te conectes, y sal al exterior para mejor señal GPS.')}
                className="text-xs text-blue-500 underline font-normal"
              >
                ¿Problemas GPS?
              </button>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={ubicacion}
                onChange={e => {
                  setUbicacion(e.target.value)
                  if (e.target.value) recargarIframe(e.target.value)
                }}
                placeholder="Ej: Calle Mayor 12 (o usa el GPS →)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none"
              />
              <button
                onClick={estadoGPS === 'ok' ? undefined : obtenerGPS}
                disabled={estadoGPS === 'buscando'}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 whitespace-nowrap ${btnGPSClase}`}
              >
                {btnGPSTexto}
              </button>
            </div>
            <p className="text-xs text-blue-700/60 mt-2">
              ℹ️ Selecciona la ubicación antes de rellenar el formulario.
            </p>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Formulario Tally embebido */}
          <iframe
            src={iframeSrc}
            loading="lazy"
            width="100%"
            height="400"
            frameBorder="0"
            title="Reportar Incidencia"
            className="w-full transition-opacity duration-300"
          />
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Para emergencias graves llama al <span className="font-bold text-red-500">112</span>.
        </p>
      </main>

      <footer className="bg-gray-900 text-gray-500 py-5 text-center text-sm">
        <p>© 2026 Protección Civil Aigües.</p>
      </footer>
    </div>
  )
}
