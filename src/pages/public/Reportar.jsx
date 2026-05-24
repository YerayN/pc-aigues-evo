import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import NavBarPublica from '../../components/layout/NavBarPublica'
import { supabase } from '../../lib/supabase'

// Reparamos los iconos por defecto de Leaflet para producción
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Componente hijo para capturar los clics o toques en el mapa público
function MapClickHandler({ onClic }) {
  useMapEvents({
    click: (e) => onClic(e.latlng),
  })
  return null
}

export default function Reportar() {
  // Estados de la incidencia
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [coordenadas, setCoordenadas] = useState(null) // { lat, lng }
  const [tipoIncidencia, setTipoIncidencia] = useState('Otros')
  const [descripcion, setDescripcion] = useState('')
  
  // Datos opcionales del ciudadano
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')

  // Estados de control
  const [enviando, setEnviando] = useState(false)
  const [enviadoExito, setEnviadoExito] = useState(false)
  const [mostrarMapa, setMostrarMapa] = useState(false)

  function handleMapClic(latlng) {
    setCoordenadas(latlng)
    // Dejamos que el usuario mantenga el mapa abierto o lo cierre al marcar, 
    // pero le damos feedback visual inmediato
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!ubicacionTexto.trim()) {
      alert('Por favor, describe la ubicación en el campo de texto.')
      return
    }

    setEnviando(true)

    try {
      const { error } = await supabase
        .from('incidencias')
        .insert([
          {
            nombre_ciudadano: nombre || 'Anónimo',
            telefono_ciudadano: telefono || null,
            tipo: tipoIncidencia,
            ubicacion_texto: ubicacionTexto,
            coordenadas: coordenadas ? `${coordenadas.lat},${coordenadas.lng}` : null,
            descripcion: descripcion,
            estado: 'Pendiente',
            creado_el: new Date().toISOString()
          }
        ])

      if (error) throw error
      setEnviadoExito(true)
    } catch (error) {
      console.error('Error al enviar:', error)
      alert('Hubo un problema al enviar el reporte. Por favor, inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBarPublica />

      <header className="bg-pc-orange text-white py-6 text-center shadow-md shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold mb-1">📸 Reporte Ciudadano</h2>
        <p className="text-orange-100 text-xs md:text-sm px-4">Informa de una incidencia directamente a Protección Civil.</p>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 md:p-8">
          
          {enviadoExito ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reporte Enviado!</h3>
              <p className="text-gray-600 mb-6 text-sm px-2">La unidad de Protección Civil de Aigües ha recibido el aviso correctamente. Gracias por colaborar en la seguridad del pueblo.</p>
              <button 
                onClick={() => {
                  setEnviadoExito(false); setDescripcion(''); setUbicacionTexto('');
                  setCoordenadas(null); setNombre(''); setTelefono(''); setMostrarMapa(false);
                }}
                className="bg-pc-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm w-full sm:w-auto"
              >
                Enviar otra incidencia
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* UBICACIÓN COMPUESTA (TEXTO + MAPA OPCIONAL) */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 md:p-5 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">
                    📍 ¿Dónde está la incidencia? *
                  </label>
                  <p className="text-[11px] text-blue-700/70 mb-2">
                    Escribe una calle, camino, paraje o el nombre de una finca conocida de Aigües.
                  </p>
                  <input
                    type="text"
                    required
                    value={ubicacionTexto}
                    onChange={e => setUbicacionTexto(e.target.value)}
                    placeholder="Ej: Camino del Pinatell, pasando la balsa a la izquierda"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none bg-white"
                  />
                </div>

                {/* Botón para desplegar el mapa */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setMostrarMapa(!mostrarMapa)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition active:scale-[0.99]
                      ${coordenadas 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100/50'}`}
                  >
                    {coordenadas ? '🎯 ¡Punto marcado en el mapa! (Cambiar)' : '🗺️ Marcar punto exacto en el mapa (Opcional)'}
                  </button>
                </div>

                {/* Contenedor del mapa dinámico adaptado a móviles */}
                {mostrarMapa && (
                  <div className="space-y-2 animate-fadeIn">
                    <p className="text-[10px] font-medium text-gray-500 italic text-center">
                      Mueve el mapa y da un toque/clic con el dedo exactamente sobre el lugar
                    </p>
                    <div className="w-full h-[250px] md:h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
                      <MapContainer center={[38.500, -0.363]} zoom={15} className="w-full h-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapClickHandler onClic={handleMapClic} />
                        {coordenadas && <Marker position={[coordenadas.lat, coordenadas.lng]} />}
                      </MapContainer>
                    </div>
                    {coordenadas && (
                      <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] text-gray-500">
                        <span>Coordenadas fijadas: {coordenadas.lat.toFixed(5)}, {coordenadas.lng.toFixed(5)}</span>
                        <button 
                          type="button" 
                          onClick={() => setCoordenadas(null)}
                          className="text-red-500 font-bold underline"
                        >
                          Quitar marca
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tipo de Incidencia */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de Incidencia *</label>
                <select
                  value={tipoIncidencia}
                  onChange={e => setTipoIncidencia(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none bg-white"
                >
                  <option value="Obstáculo en vía">Obstáculo en la vía / Árbol caído</option>
                  <option value="Inundación/Agua">Desperfecto / Inundación</option>
                  <option value="Corte de camino">Camino o vía bloqueada</option>
                  <option value="Aviso de riesgo">Aviso de riesgo / Peligro de incendio</option>
                  <option value="Otros">Otros (Especificar en la descripción)</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">¿Qué está ocurriendo? *</label>
                <textarea
                  required
                  rows="4"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe la situación (ej: desprendimiento de piedras, poste de luz colgando, bache profundo...)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none resize-none"
                />
              </div>

              <hr className="border-gray-100 my-2" />

              {/* Datos de contacto opcionales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tu Nombre (Opcional)</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Para identificarte"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono (Opcional)</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Por si te llamamos"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none"
                  />
                </div>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-pc-orange hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl transition shadow-md active:scale-[0.99] mt-4 text-sm"
              >
                {enviando ? '⏳ Enviando reporte oficial...' : '🚀 Enviar Reporte a Protección Civil'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-6 px-4">
          Para emergencias graves o de riesgo vital inmediato, llama siempre al <span className="font-bold text-red-500">112</span>.
        </p>
      </main>

      <footer className="bg-gray-900 text-gray-500 py-4 text-center text-xs shrink-0">
        <p>© 2026 Protección Civil Aigües.</p>
      </footer>
    </div>
  )
}