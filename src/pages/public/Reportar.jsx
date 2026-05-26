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
  
  // Datos del ciudadano
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('') // ¡Ahora obligatorio!

  // Estados de control
  const [enviando, setEnviando] = useState(false)
  const [enviadoExito, setEnviadoExito] = useState(false)
  const [mostrarMapa, setMostrarMapa] = useState(false)

  function handleMapClic(latlng) {
    setCoordenadas(latlng)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validación de ubicación: Exigimos texto O coordenadas en el mapa
    if (!ubicacionTexto.trim() && !coordenadas) {
      alert('Por favor, indica dónde está la incidencia: escribe una descripción de la ubicación o márcala en el mapa.')
      return
    }

    setEnviando(true)

    try {
      const textoUbicacionFinal = ubicacionTexto.trim() || 'Ubicación señalada en el mapa'

      // 1. Guardamos en tu tabla de Supabase para la intranet
      const { error: supabaseError } = await supabase
        .from('incidencias')
        .insert([
          {
            nombre_ciudadano: nombre || 'Anónimo',
            telefono_ciudadano: telefono,
            tipo: tipoIncidencia,
            ubicacion_texto: textoUbicacionFinal,
            coordenadas: coordenadas ? `${coordenadas.lat},${coordenadas.lng}` : null,
            descripcion: descripcion,
            estado: 'Pendiente',
            creado_el: new Date().toISOString()
          }
        ])

      if (supabaseError) throw supabaseError

// 2. ENVÍO DIRECTO A TELEGRAM VÍA JAVASCRIPT (Con enlace opcional a Google Maps)
    const tokenBot = import.meta.env.VITE_TELEGRAM_TOKEN
    const idGrupo = '-1003973593092'

    // Función rápida para limpiar textos y que el Markdown de Telegram no se rompa con caracteres especiales
    const limpiarMarkdown = (texto) => {
      if (!texto) return ''
      return texto.replace(/[*_`[\]()]/g, '') // Quita caracteres conflictivos
    }

    // 1. Montamos la base del mensaje limpio
    let mensajeTelegram = `🚨 *REPORTE CIUDADANO* 🚨\n\n` +
                          `🗂️ *Tipo:* ${limpiarMarkdown(tipoIncidencia)}\n` +
                          `📍 *Ubicación:* ${limpiarMarkdown(textoUbicacionFinal)}\n` +
                          `📝 *Detalles:* ${limpiarMarkdown(descripcion)}\n` +
                          `👤 *Informante:* ${limpiarMarkdown(nombre) || 'Anónimo'}\n` +
                          `📞 *Teléfono:* ${limpiarMarkdown(telefono)}`

    // 2. SI EL VECINO USÓ EL MAPA: Le acoplamos el enlace directo a Google Maps
    if (coordenadas) {
      // URL oficial y limpia para Google Maps usando las coordenadas reales
      const urlMaps = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`
      mensajeTelegram += `\n\n🗺️ *Mapa:* [Ver ubicación exacta en Google Maps](${urlMaps})`
    }

    // Hacemos la llamada HTTP directa a Telegram con el parse_mode reactivado de forma segura
    const respuestaTelegram = await fetch(`https://api.telegram.org/bot${tokenBot}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: idGrupo,
        text: mensajeTelegram,
        parse_mode: 'Markdown',
        disable_web_page_preview: false // Permite que se vea una vista previa del mapa si queréis
      })
    })

    if (!respuestaTelegram.ok) {
      const datosError = await respuestaTelegram.json()
      throw new Error(`Telegram respondió con error: ${datosError.description}`)
    }

    // Si todo ha ido bien, marcamos éxito
    setEnviadoExito(true)

    } catch (error) {
      console.error('Error en el proceso:', error)
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
              
              {/* UBICACIÓN COMPUESTA (TEXTO O MAPA) */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 md:p-5 space-y-3">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">
                    📍 ¿Dónde está la incidencia? *
                  </label>
                  <p className="text-[11px] text-blue-700/70 mb-2">
                    Escribe una calle/camino de Aigües **O BIEN** abre el mapa de abajo para marcar el punto exacto.
                  </p>
                  <input
                    type="text"
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
                    {coordenadas ? '🎯 ¡Punto marcado en el mapa! (Cambiar)' : '🗺️ Marcar punto exacto en el mapa (Opcional si escribes la dirección)'}
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
                  placeholder="Describe la situación (ej: desprendimiento de piedras, poste de luz colgando...)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none resize-none"
                />
              </div>

              <hr className="border-gray-100 my-2" />

              {/* Datos de contacto (Nombre opcional, Teléfono OBLIGATORIO) */}
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Obligatorio para emergencias"
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