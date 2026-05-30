import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Popup } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../../lib/supabase'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLOR_LEAFLET = { azul: 'blue', rojo: 'red', verde: 'green', naranja: 'orange', amarillo: 'gold' }
const COLOR_HEX     = { rojo: '#e11d48', azul: '#2563eb', verde: '#16a34a', naranja: '#ea580c', amarillo: '#ca8a04' }

function crearIcono(color) {
  return new L.Icon({
    iconUrl:   `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${COLOR_LEAFLET[color] ?? 'blue'}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  })
}

function esVisible(el) {
  if (!el.inicio && !el.fin) return true
  const ahora = new Date()
  return ahora >= new Date(el.inicio) && ahora <= new Date(el.fin)
}

export default function MapaPublico() {
  const [elementos, setElementos] = useState([])
  const [estado, setEstado] = useState('cargando')

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('mapa_elementos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Mapa] Error Supabase:', error.message)
      setEstado('error')
      return
    }
    setElementos(data ?? [])
    setEstado('ok')
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 60_000)

    const channel = supabase
      .channel(`mapa-pub-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mapa_elementos' }, cargar)
      .subscribe()

    return () => { clearInterval(interval); supabase.removeChannel(channel) }
  }, [cargar])

  if (estado === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="text-center p-8 max-w-sm">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="font-bold text-gray-700 mb-2">Sin conexión con la base de datos</p>
          <p className="text-sm text-gray-500 mb-1">Comprueba que el archivo <code className="bg-gray-100 px-1 rounded text-xs">.env</code> existe y tiene:</p>
          <pre className="text-xs bg-gray-100 rounded p-3 text-left mt-2 mb-4 text-gray-700">
{`VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...`}
          </pre>
          <button onClick={cargar} className="bg-pc-blue text-white text-sm px-5 py-2 rounded-xl hover:bg-pc-blue-dark transition">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const visibles = elementos.filter(esVisible)

  return (
    <div className="relative w-full h-full">
      <MapContainer center={[38.500, -0.363]} zoom={16} className="w-full h-full" zoomControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {visibles.map(el => {
          const hex   = COLOR_HEX[el.color]   ?? COLOR_HEX.azul
          const icono = crearIcono(el.color)
          const popup = (
            <Popup>
              <strong>{el.titulo}</strong>
              {el.descripcion && <p className="text-xs mt-1">{el.descripcion}</p>}
            </Popup>
          )

          if (el.tipo === 'punto' && el.lat != null && el.lng != null) {
            return (
              <Marker key={el.id} position={[parseFloat(el.lat), parseFloat(el.lng)]} icon={icono}>
                {popup}
              </Marker>
            )
          }
          if (el.tipo === 'linea' && Array.isArray(el.coordenadas)) {
            return <Polyline key={el.id} positions={el.coordenadas} color={hex} weight={5} opacity={0.85}>{popup}</Polyline>
          }
          if (el.tipo === 'zona' && Array.isArray(el.coordenadas)) {
            return <Polygon key={el.id} positions={el.coordenadas} color={hex} fillOpacity={0.25}>{popup}</Polygon>
          }
          return null
        })}
      </MapContainer>

      {estado === 'cargando' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[400] rounded-2xl">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow text-sm font-medium text-gray-600">
            <div className="w-4 h-4 border-2 border-pc-blue border-t-transparent rounded-full animate-spin" />
            Cargando mapa...
          </div>
        </div>
      )}
    </div>
  )
}
