import { useState } from 'react'
import NavBarPublica from '../../components/layout/NavBarPublica'
import { supabase } from '../../lib/supabase'

export default function Reportar() {
  const [ubicacion, setUbicacion] = useState('')
  const [estadoGPS, setEstadoGPS] = useState('idle') // idle | buscando | ok | error
  const [coordenadas, setCoordenadas] = useState('') // Guardamos lat/lng puras para la base de datos
  
  // Estados para el nuevo formulario nativo
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoIncidencia, setTipoIncidencia] = useState('Otros')
  const [enviando, setEnviando] = useState(false)
  const [enviadoExito, setEnviadoExito] = useState(false)

  function obtenerGPS() {
    if (!navigator.geolocation) {
      alert('GPS no disponible en este dispositivo.')
      return
    }
    setEstadoGPS('buscando')

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords
        setUbicacion(`📍 GPS detectado (±${Math.round(acc)}m)`)
        setCoordenadas(`${lat},${lng}`)
        setEstadoGPS('ok')
        if (acc > 1000) alert(`Aviso: ubicación aproximada (error: ${Math.round(acc)}m).`)
      },
      () => {
        setEstadoGPS('error')
        alert('No se pudo obtener la ubicación. Activa el GPS e inténtalo de nuevo.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!descripcion.trim() || !ubicacion.trim()) {
      alert('Por favor, rellena al menos la ubicación y la descripción de la incidencia.')
      return
    }

    setEnviando(true)

    try {
      // Insertamos el reporte directamente en tu tabla de Supabase
      const { error } = await supabase
        .from('incidencias') // Cambia el nombre por tu tabla si se llama distinto
        .insert([
          {
            nombre_ciudadano: nombre || 'Anónimo',
            telefono_ciudadano: telefono || null,
            tipo: tipoIncidencia,
            ubicacion_texto: ubicacion,
            coordenadas: coordenadas || null,
            descripcion: descripcion,
            estado: 'Pendiente', // Para que el Jefe lo gestione en el panel
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
        <p className="text-orange-100 text-sm">Informa de una incidencia directamente a Protección Civil.</p>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-pc border border-gray-100 p-6 md:p-8">
          
          {enviadoExito ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reporte Enviado!</h3>
              <p className="text-gray-600 mb-6">Gracias por colaborar. La unidad de Protección Civil de Aigües ha recibido el aviso y lo revisará lo antes posible.</p>
              <button 
                onClick={() => { setEnviadoExito(false); setDescripcion(''); setUbicacion(''); setEstadoGPS('idle'); setCoordenadas(''); }}
                className="bg-pc-orange hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Enviar otra incidencia
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Selector de ubicación mejorado */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <label className="flex justify-between items-center text-sm font-bold text-blue-900 mb-3">
                  <span>📍 Ubicación de la incidencia *</span>
                  <button
                    type="button"
                    onClick={() => alert('💡 Activa el WiFi aunque no te conectes, y sal al exterior para mejor señal GPS.')}
                    className="text-xs text-blue-500 underline font-normal"
                  >
                    ¿Problemas GPS?
                  </button>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={ubicacion}
                    onChange={e => setUbicacion(e.target.value)}
                    placeholder="Ej: Calle Mayor 12 (o usa el GPS →)"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={estadoGPS === 'ok' ? undefined : obtenerGPS}
                    disabled={estadoGPS === 'buscando'}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 whitespace-nowrap ${btnGPSClase}`}
                  >
                    {btnGPSTexto}
                  </button>
                </div>
              </div>

              {/* Tipo de Incidencia */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Incidencia *</label>
                <select
                  value={tipoIncidencia}
                  onChange={e => setTipoIncidencia(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none bg-white"
                >
                  <option value="Obstáculo en vía">Obstáculo en la vía</option>
                  <option value="Inundación/Agua">Desperfecto / Inundación</option>
                  <option value="Corte de camino">Camino o vía bloqueada</option>
                  <option value="Aviso de riesgo">Aviso de riesgo/Peligro</option>
                  <option value="Otros">Otros (Especificar abajo)</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué está ocurriendo? *</label>
                <textarea
                  required
                  rows="4"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe detalladamente la situación para que los voluntarios sepan qué material llevar..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none resize-none"
                />
              </div>

              <hr className="border-gray-100 my-2" />

              {/* Datos de contacto opcionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Por si necesitamos llamarte"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none"
                  />
                </div>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-pc-orange hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-[0.99] mt-4"
              >
                {enviando ? '⏳ Enviando reporte...' : '🚀 Enviar Reporte Oficial'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Para emergencies graves llama al <span className="font-bold text-red-500">112</span>.
        </p>
      </main>

      <footer className="bg-gray-900 text-gray-500 py-5 text-center text-sm">
        <p>© 2026 Protección Civil Aigües.</p>
      </footer>
    </div>
  )
}