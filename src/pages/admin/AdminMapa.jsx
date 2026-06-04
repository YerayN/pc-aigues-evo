import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { supabase } from '../../lib/supabase'
import { Button, Badge } from '../../components/ui'
import Swal from 'sweetalert2'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Creamos un icono limpio y estático para los puntos intermedios y evitamos fallos
const iconPuntoIntermedio = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

const COLOR_HEX = { rojo: '#e11d48', azul: '#2563eb', verde: '#16a34a', naranja: '#ea580c' }

function MapClickHandler({ onClic }) {
  useMapEvents({ click: e => onClic(e.latlng) })
  return null
}

const MODOS = [
  { id: 'punto', label: 'Punto', icon: '📍' },
  { id: 'linea', label: 'Corte', icon: '➖' },
  { id: 'zona',  label: 'Zona',  icon: '⬠' },
]

function estadoElemento(el) {
  if (!el.inicio && !el.fin) return { label: 'Activo', variant: 'green' }
  const ahora = new Date()
  if (ahora < new Date(el.inicio)) return { label: 'Programado', variant: 'blue' }
  if (ahora > new Date(el.fin))    return { label: 'Finalizado', variant: 'red' }
  return { label: 'En curso', variant: 'green' }
}

export default function AdminMapa() {
  const [modo,       setModo]       = useState('punto')
  const [puntos,     setPuntos]     = useState([])
  const [puntoClic,  setPuntoClic]  = useState(null)
  const [elementos,  setElementos]  = useState([])
  const [loading,    setLoading]    = useState(false)

  const [titulo,     setTitulo]     = useState('')
  const [desc,       setDesc]       = useState('')
  const [color,      setColor]      = useState('azul')
  const [fechaIni,   setFechaIni]   = useState('')
  const [fechaFin,   setFechaFin]   = useState('')

  const cargarElementos = useCallback(async () => {
    const { data } = await supabase.from('mapa_elementos').select('*').order('created_at', { ascending: false })
    setElementos(data ?? [])
  }, [])

  useEffect(() => { cargarElementos() }, [cargarElementos])

  function cambiarModo(m) {
    setModo(m)
    setPuntos([])
    setPuntoClic(null)
  }

  function handleMapClic(latlng) {
    if (modo === 'punto') {
      setPuntoClic(latlng)
      setPuntos([])
    } else {
      setPuntos(prev => [...prev, [latlng.lat, latlng.lng]])
    }
  }

  function resetDibujo() {
    setPuntos([])
    setPuntoClic(null)
  }

  async function guardar(e) {
    e.preventDefault()

    if (modo === 'punto' && !puntoClic) {
      Swal.fire({ icon: 'warning', title: '¡Falta el punto!', text: 'Toca en el mapa donde quieras colocar el aviso.' })
      return
    }
    
    // Validaciones separadas para que nadie guarde áreas rotas de 2 puntos
    if (modo === 'linea' && puntos.length < 2) {
      Swal.fire({ icon: 'warning', title: 'Faltan puntos', text: 'Necesitas dibujar al menos 2 puntos para un corte de vía.' })
      return
    }
    if (modo === 'zona' && puntos.length < 3) {
      Swal.fire({ icon: 'warning', title: 'Faltan puntos', text: 'Necesitas dibujar al menos 3 puntos para cerrar un área.' })
      return
    }

    setLoading(true)

    const datos = {
      titulo, descripcion: desc, tipo: modo, color,
      inicio: fechaIni ? new Date(fechaIni) : null,
      fin:    fechaFin ? new Date(fechaFin) : null,
    }

    if (modo === 'punto') {
      datos.lat = puntoClic.lat
      datos.lng = puntoClic.lng
    } else {
      datos.coordenadas = puntos
    }

    const { error } = await supabase.from('mapa_elementos').insert([datos])

    if (error) {
      Swal.fire('Error', error.message, 'error')
    } else {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
        .fire({ icon: 'success', title: 'Publicado en el mapa' })
      setTitulo(''); setDesc(''); setColor('azul'); setFechaIni(''); setFechaFin('')
      resetDibujo(); setModo('punto')
      cargarElementos()
    }
    setLoading(false)
  }

  async function eliminar(id) {
    const { isConfirmed } = await Swal.fire({ title: '¿Borrar del mapa?', text: 'Desaparecerá al instante de la web.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar' })
    if (!isConfirmed) return
    await supabase.from('mapa_elementos').delete().eq('id', id)
    cargarElementos()
  }

  const colorHex = COLOR_HEX[color] ?? COLOR_HEX.azul

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <NavBarIntranet />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Mapa ── */}
        <div className="w-full md:w-2/3 h-[45vh] md:h-full relative z-0">
          <MapContainer center={[38.500, -0.363]} zoom={16} className="w-full h-full" zoomControl>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onClic={handleMapClic} />

            {/* Preview del dibujo actual */}
            {modo === 'punto' && puntoClic && <Marker position={[puntoClic.lat, puntoClic.lng]} />}
            {modo === 'linea' && puntos.length > 1 && <Polyline positions={puntos} color={colorHex} weight={4} dashArray="6 8" />}
            {modo === 'zona'  && puntos.length > 2 && <Polygon  positions={puntos} color={colorHex} fillOpacity={0.25} />}

            {/* Puntos intermedios con el icono estable */}
            {modo !== 'punto' && puntos.map((p, i) => (
              <Marker key={i} position={p} icon={iconPuntoIntermedio} />
            ))}
          </MapContainer>

          {/* Tooltip instrucciones */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur px-4 py-1.5 rounded-full shadow text-xs font-bold text-pc-blue border border-blue-100">
            {modo === 'punto' ? '📍 Toca en el mapa para colocar el marcador'
              : modo === 'linea' ? `➖ ${puntos.length} puntos — toca para añadir más`
              : `⬠ ${puntos.length} vértices — toca para añadir más`}
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div className="w-full md:w-1/3 bg-white border-t-4 md:border-t-0 md:border-l border-pc-orange overflow-y-auto flex flex-col">
          <div className="p-4 md:p-5 border-b border-gray-100">
            <h2 className="font-bold text-pc-blue text-lg hidden md:block mb-4">Nuevo Elemento</h2>

            <form onSubmit={guardar} className="space-y-3">
              {/* Tipo */}
              <div className="grid grid-cols-3 gap-2">
                {MODOS.map(m => (
                  <button key={m.id} type="button" onClick={() => cambiarModo(m.id)}
                    className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold border transition
                      ${modo === m.id ? 'bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                    <span className="text-lg mb-0.5">{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              {/* Título y color */}
              <input type="text" required placeholder="Título del aviso..." value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none" />

              <div className="grid grid-cols-2 gap-3">
                <select value={color} onChange={e => setColor(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                  <option value="azul">🔵 Azul (Info)</option>
                  <option value="rojo">🔴 Rojo (Peligro)</option>
                  <option value="naranja">🟠 Naranja (Obras)</option>
                  <option value="verde">🟢 Verde (Seguro)</option>
                </select>
                <input type="text" placeholder="Descripción..." value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none" />
              </div>

              {/* Programación */}
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">📅 Programación (opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Inicio</label>
                    <input type="datetime-local" value={fechaIni} onChange={e => setFechaIni(e.target.value)}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Fin</label>
                    <input type="datetime-local" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Estado del dibujo */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 text-xs">
                <span className="text-gray-500 italic">
                  {modo === 'punto'
                    ? puntoClic ? '✅ Punto marcado' : 'Toca el mapa'
                    : `${puntos.length} punto(s) dibujados`}
                </span>
                {(puntoClic || puntos.length > 0) && (
                  <button type="button" onClick={resetDibujo}
                    className="text-red-500 font-bold border border-red-200 bg-white px-2 py-0.5 rounded-lg hover:bg-red-50 transition">
                    Borrar
                  </button>
                )}
              </div>

              <Button type="submit" loading={loading} variant="primary" size="lg" className="w-full">
                💾 Guardar en el Mapa
              </Button>
            </form>
          </div>

          {/* Lista elementos */}
          <div className="p-4 flex-1">
            <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              📡 Elementos activos
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{elementos.length}</span>
            </h3>
            <div className="space-y-2">
              {elementos.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">El mapa está limpio</p>}
              {elementos.map(el => {
                const { label, variant } = estadoElemento(el)
                const icono = el.tipo === 'punto' ? '📍' : el.tipo === 'linea' ? '➖' : '⬠'
                return (
                  <div key={el.id} className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{icono}</span>
                        <span className="font-bold text-gray-700 text-xs truncate">{el.titulo}</span>
                        <Badge variant={variant} className="shrink-0">{label}</Badge>
                      </div>
                      {el.descripcion && <p className="text-[10px] text-gray-400 truncate mt-0.5 ml-5">{el.descripcion}</p>}
                    </div>
                    <button onClick={() => eliminar(el.id)}
                      className="ml-2 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0">
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}