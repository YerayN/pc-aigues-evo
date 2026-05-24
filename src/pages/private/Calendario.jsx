import { useState, useEffect, useCallback } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LoadingPage, EmptyState, Badge } from '../../components/ui'
import Swal from 'sweetalert2'

export default function Calendario() {
  const { perfil } = useAuth()
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(true)
  const [soloMios, setSoloMios]   = useState(false)

  const miNombre = perfil?.nombre ?? ''

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('servicios').select('*')
    const ordenados = (data ?? []).sort((a, b) =>
      new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`)
    )
    setServicios(ordenados)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)

  const visibles = servicios
    .filter(ev => new Date(ev.fecha) >= hoy)
    .filter(ev => {
      if (!soloMios) return true
      const enEquipo     = (ev.equipo      ?? []).some(v => v.nombre === miNombre)
      const enCandidatos = (ev.candidatos  ?? []).some(c => c.nombre === miNombre)
      return enEquipo || enCandidatos
    })

  async function solicitarAsistencia(idEvento) {
    const { isConfirmed } = await Swal.fire({
      title: '¿Quieres apuntarte?',
      text: 'Confirma que tienes disponibilidad para este día y hora.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, contar conmigo',
      cancelButtonText: 'Cancelar',
    })
    if (!isConfirmed) return

    Swal.fire({ title: 'Enviando...', didOpen: () => Swal.showLoading() })

    const { data: evento } = await supabase.from('servicios').select('*').eq('id', idEvento).single()
    const actuales = evento.candidatos ?? []
    if (actuales.some(c => c.nombre === miNombre)) {
      Swal.fire({ icon: 'info', title: 'Ya habías enviado una solicitud', timer: 2000, showConfirmButton: false })
      return
    }

    const nuevaLista = [...actuales, { nombre: miNombre, fecha: new Date() }]
    const { error } = await supabase.from('servicios').update({ candidatos: nuevaLista }).eq('id', idEvento)

    if (!error) {
      Swal.fire({ icon: 'success', title: '¡Solicitud enviada!', text: 'El Jefe ha recibido tu disponibilidad.', confirmButtonColor: '#003366' })
      cargar()
    } else {
      Swal.fire('Error', error.message, 'error')
    }
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tablón de Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">Próximos eventos convocados por la agrupación</p>

          <label className="inline-flex items-center gap-2 mt-4 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloMios}
              onChange={e => setSoloMios(e.target.checked)}
              className="w-4 h-4 text-pc-orange focus:ring-pc-orange border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Ver solo mis asignaciones</span>
          </label>
        </div>

        <div className="space-y-4">
          {visibles.length === 0 ? (
            <EmptyState icon="📭" title="No hay servicios próximos" description={soloMios ? 'No tienes asignaciones en los próximos eventos.' : 'El jefe aún no ha publicado servicios.'} />
          ) : visibles.map(ev => {
            const equipo     = ev.equipo     ?? []
            const candidatos = ev.candidatos ?? []
            const estoyDentro   = equipo.some(v => v.nombre === miNombre)
            const estoyPendiente = candidatos.some(c => c.nombre === miNombre)

            const fechaBonita = new Date(ev.fecha).toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long'
            })

            let bordeColor   = 'border-l-pc-blue'
            let estadoBadge  = null

            if (estoyDentro) {
              bordeColor  = 'border-l-green-500'
              estadoBadge = <Badge variant="green">✅ Asignado</Badge>
            } else if (estoyPendiente) {
              bordeColor  = 'border-l-yellow-500'
              estadoBadge = <Badge variant="yellow">⏳ Pendiente</Badge>
            }

            return (
              <div key={ev.id} className={`bg-white rounded-2xl shadow-pc border-l-4 ${bordeColor} overflow-hidden`}>
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-800 text-base md:text-lg capitalize truncate">{ev.titulo}</h2>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium capitalize">
                          📅 {fechaBonita}
                        </span>
                        <span className="text-xs bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                          ⏰ {ev.hora}h
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {estadoBadge ?? (
                        <button
                          onClick={() => solicitarAsistencia(ev.id)}
                          className="w-full sm:w-auto bg-pc-blue hover:bg-pc-blue-dark text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                        >
                          🙋 Me apunto
                        </button>
                      )}
                    </div>
                  </div>

                  {ev.descripcion && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                      <p className="text-sm text-gray-700 italic">"{ev.descripcion}"</p>
                    </div>
                  )}

                  {/* Equipo */}
                  {equipo.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Equipo confirmado
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {equipo.map((v, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100">
                            <span className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center text-[9px] font-bold">
                              {v.nombre.charAt(0).toUpperCase()}
                            </span>
                            {v.nombre.split(' ')[0]}
                            <span className="text-blue-400 text-[10px]">· {v.puesto}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {equipo.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Sin confirmaciones aún</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
