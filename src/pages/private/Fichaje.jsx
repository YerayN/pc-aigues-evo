import { useState, useEffect } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { useFichaje } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import { LoadingPage } from '../../components/ui'
import { ACTIVIDADES } from '../../constants/actividades'
import Swal from 'sweetalert2' // Añadido SweetAlert2

function pad(n) { return String(n).padStart(2, '0') }

function useCronometro(horaEntrada) {
  const [display, setDisplay] = useState('00:00:00')

  useEffect(() => {
    if (!horaEntrada) { setDisplay('00:00:00'); return }
    const tick = () => {
      const diff = Date.now() - horaEntrada.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setDisplay(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [horaEntrada])

  return display
}

export default function Fichaje() {
  const { perfil } = useAuth()
  const { sesionActiva, horaEntrada, actividadActual, loading, entrar, salir } = useFichaje(perfil?.nombre)
  const [actividad,  setActividad]  = useState(ACTIVIDADES[0].value)
  const [historial,  setHistorial]  = useState([])
  const [cargandoBtn, setCargandoBtn] = useState(false)
  const cronometro = useCronometro(sesionActiva ? horaEntrada : null)

  useEffect(() => {
    if (!perfil?.nombre) return
    supabase.from('registro_horas').select('*')
      .eq('usuario', perfil.nombre)
      .not('salida', 'is', null)
      .order('entrada', { ascending: false })
      .limit(10)
      .then(({ data }) => setHistorial(data ?? []))
  }, [perfil, sesionActiva])

  async function handleAccion() {
    if (sesionActiva) {
      // Usamos Swal en lugar del confirm() problemático
      const { isConfirmed } = await Swal.fire({
        title: '¿Terminar turno?',
        text: 'Se guardarán tus horas en el registro oficial.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, terminar',
        cancelButtonText: 'Cancelar'
      })
      
      if (!isConfirmed) return
      
      setCargandoBtn(true)
      await salir()
      setCargandoBtn(false)
    } else {
      setCargandoBtn(true)
      await entrar(actividad)
      setCargandoBtn(false)
    }
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />
      <main className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-5 text-center">⏱️ Control Horario</h1>

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-pc border border-gray-100 p-8 flex flex-col items-center mb-6">

          {/* Badge estado */}
          <div className={`mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
            ${sesionActiva ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
            {sesionActiva ? `🟢 En servicio · ${actividadActual}` : '💤 Fuera de servicio'}
          </div>

          {/* Cronómetro */}
          <div className="text-5xl font-mono font-bold text-gray-800 mb-6 tabular-nums tracking-wider">
            {cronometro}
          </div>

          {/* Selector actividad */}
          {!sesionActiva && (
            <select
              value={actividad}
              onChange={e => setActividad(e.target.value)}
              className="mb-6 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-center bg-gray-50 focus:ring-2 focus:ring-pc-orange outline-none text-sm"
            >
              {ACTIVIDADES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          )}

          {/* Botón principal circular */}
          <button
            onClick={handleAccion}
            disabled={cargandoBtn}
            className={`w-40 h-40 rounded-full shadow-xl flex flex-col items-center justify-center
              transition-all active:scale-95 border-4 border-white ring-4 font-bold text-white
              ${sesionActiva
                ? 'bg-red-500 hover:bg-red-600 ring-red-100'
                : 'bg-green-500 hover:bg-green-600 ring-green-100'
              } disabled:opacity-60`}
          >
            <span className="text-4xl mb-1">{sesionActiva ? '🏁' : '👆'}</span>
            <span className="text-sm uppercase tracking-wider leading-tight text-center">
              {sesionActiva ? 'TERMINAR\nTURNO' : 'FICHAR\nENTRADA'}
            </span>
          </button>

          {sesionActiva && horaEntrada && (
            <p className="mt-4 text-xs text-gray-400">
              Entrada: {horaEntrada.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
            </p>
          )}
        </div>

        {/* Historial */}
        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3 ml-1">
          📅 Mis últimas horas
        </h3>
        <div className="space-y-2">
          {historial.length === 0 && (
            <p className="text-gray-400 text-sm text-center italic py-4">Sin registros recientes</p>
          )}
          {historial.map(r => {
            const diff = new Date(r.salida) - new Date(r.entrada)
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            return (
              <div key={r.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-700 text-sm">{r.actividad}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.entrada).toLocaleDateString('es-ES')} &middot;{' '}
                    {new Date(r.entrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(r.salida).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold shrink-0">
                  {h}h {m}m
                </span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}