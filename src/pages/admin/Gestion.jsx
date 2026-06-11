import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button, Card, Badge, LoadingPage, EmptyState } from '../../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Swal from 'sweetalert2'
import { ACTIVIDADES } from '../../constants/actividades'

const COLOR_HEX = { rojo: '#e11d48', azul: '#2563eb', verde: '#16a34a', naranja: '#ea580c' }
const COLOR_ACT = Object.fromEntries(ACTIVIDADES.map(a => [a.value, a.color]))

function KPI({ valor, label, sub, color = 'text-pc-blue', icon }) {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-5 shadow-pc border border-gray-100 flex items-center gap-2 md:gap-4">
      {icon && (
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg md:text-2xl shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className={`text-lg md:text-2xl font-bold leading-none ${color}`}>{valor}</p>
        <p className="text-[11px] md:text-sm font-medium text-gray-700 mt-1 leading-tight">{label}</p>
        {sub && <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function TarjetaServicio({ evento, usuarios, esHistorial, onBorrar, onRefresh }) {
  const [guardando, setGuardando] = useState(false)
  const equipo     = evento.equipo     ?? []
  const candidatos = evento.candidatos ?? []

  const fechaBonita = new Date(evento.fecha).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  async function anadirVoluntario(e) {
    e.preventDefault()
    const nombre = e.target.nombre.value.trim()
    const puesto = e.target.puesto.value.trim() || 'General'
    if (!nombre) return
    if (equipo.some(v => v.nombre === nombre)) {
      Swal.fire({ icon: 'warning', title: 'Ya asignado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
      return
    }
    setGuardando(true)
    await supabase.from('servicios').update({ equipo: [...equipo, { nombre, puesto }] }).eq('id', evento.id)
    e.target.reset()
    await onRefresh()
    setGuardando(false)
  }

  async function borrarVoluntario(idx) {
    await supabase.from('servicios').update({ equipo: equipo.filter((_, i) => i !== idx) }).eq('id', evento.id)
    onRefresh()
  }

  async function aceptarCandidato(idx) {
    const cand = candidatos[idx]
    await supabase.from('servicios').update({
      equipo:     [...equipo, { nombre: cand.nombre, puesto: 'General' }],
      candidatos: candidatos.filter((_, i) => i !== idx),
    }).eq('id', evento.id)
    onRefresh()
  }

  async function rechazarCandidato(idx) {
    const { isConfirmed } = await Swal.fire({ title: '¿Rechazar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Rechazar', cancelButtonText: 'Cancelar' })
    if (!isConfirmed) return
    await supabase.from('servicios').update({ candidatos: candidatos.filter((_, i) => i !== idx) }).eq('id', evento.id)
    onRefresh()
  }

  return (
    <div className={`bg-white rounded-2xl shadow-pc border-l-4 overflow-hidden
      ${esHistorial ? 'border-l-gray-200 opacity-75' : 'border-l-pc-blue'}`}>
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-base capitalize truncate">{evento.titulo}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium capitalize">📅 {fechaBonita}</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">⏰ {evento.hora}h</span>
            </div>
          </div>
          {!esHistorial && (
            <button onClick={() => onBorrar(evento.id)} className="text-gray-300 hover:text-red-500 p-1 transition shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {evento.descripcion && (
          <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3 mb-3">"{evento.descripcion}"</p>
        )}

        {/* Candidatos */}
        {!esHistorial && candidatos.length > 0 && (
          <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs font-bold text-yellow-700 uppercase mb-2">🔔 Pendientes ({candidatos.length})</p>
            {candidatos.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-yellow-100 mb-1">
                <span className="text-sm font-medium">{c.nombre}</span>
                <div className="flex gap-1">
                  <button onClick={() => aceptarCandidato(i)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2.5 py-1 rounded-lg transition">✅</button>
                  <button onClick={() => rechazarCandidato(i)} className="bg-red-400 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded-lg transition">❌</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Equipo */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">👥 Equipo</p>
        {equipo.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">Sin confirmaciones</p>
        ) : (
          <div className="space-y-1.5 mb-3">
            {equipo.map((v, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {v.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{v.nombre}</span>
                  <span className="text-[10px] text-gray-400 uppercase">{v.puesto}</span>
                </div>
                {!esHistorial && (
                  <button onClick={() => borrarVoluntario(i)} className="text-gray-300 hover:text-red-500 transition">✕</button>
                )}
              </div>
            ))}
          </div>
        )}

        {!esHistorial ? (
          <form onSubmit={anadirVoluntario} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
            <input list={`vols-${evento.id}`} name="nombre" placeholder="Buscar voluntario..." required autoComplete="off"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-blue outline-none bg-gray-50" />
            <datalist id={`vols-${evento.id}`}>
              {usuarios.map(u => <option key={u.nombre} value={u.nombre} />)}
            </datalist>
            <input name="puesto" placeholder="Puesto" className="sm:w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50" />
            <button type="submit" disabled={guardando}
              className="bg-blue-100 hover:bg-blue-200 text-pc-blue font-bold px-4 py-2 rounded-xl text-sm transition active:scale-95 whitespace-nowrap">
              {guardando ? '...' : '➕ Añadir'}
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-400 text-center bg-gray-50 rounded-lg py-2 border border-gray-100 mt-3">🔒 Evento finalizado</p>
        )}
      </div>
    </div>
  )
}

export default function Gestion() {
  const { perfil } = useAuth()

  const [tab, setTab] = useState('operativo') 

  const [servicios,  setServicios]  = useState([])
  const [incidenciasPendientes, setIncidenciasPendientes] = useState([])
  const [incidenciasArchivadas, setIncidenciasArchivadas] = useState([]) 
  const [usuarios,   setUsuarios]   = useState([])
  const [registros,  setRegistros]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', fecha: '', hora: '', descripcion: '' })

  // 1. AÑADIMOS EL CAMPO ICONO AL ESTADO INICIAL DEL ANUNCIO
  const [anuncio,       setAnuncio]       = useState({ mensaje: '', tipo: 'azul', icono: '📢' })
  const [alertaPublica, setAlertaPublica] = useState({ mensaje: '', color: 'verde', icono: '📢' })
  const [guardandoAnuncio, setGuardandoAnuncio] = useState(false)
  const [guardandoAlerta,  setGuardandoAlerta]  = useState(false)

  const cargarTodo = useCallback(async () => {
    setLoading(true)
    const [{ data: svcs }, { data: incs }, { data: users }, { data: regs }, { data: anun }, { data: alert }] = await Promise.all([
      supabase.from('servicios').select('*'),
      supabase.from('incidencias').select('*').order('creado_el', { ascending: false }),
      supabase.from('perfiles').select('nombre, rol').order('nombre'),
      supabase.from('registro_horas').select('*').not('salida', 'is', null).order('salida', { ascending: false }),
      supabase.from('anuncios').select('*').eq('id', 1).maybeSingle(),
      supabase.from('alerta_publica').select('*').eq('id', 1).maybeSingle(),
    ])
    const sorted = (svcs ?? []).sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
    setServicios(sorted)
    
    if (incs) {
      setIncidenciasPendientes(incs.filter(i => i.estado === 'Pendiente'))
      setIncidenciasArchivadas(incs.filter(i => i.estado === 'Archivada' || i.estado === 'Resuelta'))
    }

    setUsuarios(users ?? [])
    setRegistros(regs ?? [])
    
    // 2. RECUPERAMOS EL ICONO Y TIPO DE LA BBDD (o ponemos por defecto azul y altavoz)
    if (anun)  setAnuncio({ mensaje: anun.mensaje ?? '', tipo: anun.tipo ?? 'azul', icono: anun.icono ?? '📢' })
    if (alert) setAlertaPublica({ mensaje: alert.mensaje ?? '', color: alert.color ?? 'verde', icono: alert.icono ?? '📢' })
    setLoading(false)
  }, [])

  useEffect(() => { 
    cargarTodo() 
    const channel = supabase
      .channel('realtime-incidencias-gestion')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidencias' }, () => {
        cargarTodo()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [cargarTodo])

  const completados = useMemo(() => registros.filter(r => r.salida), [registros])

  const ranking = useMemo(() => {
    const mapa = {}
    completados.forEach(r => {
      const ms = new Date(r.salida) - new Date(r.entrada)
      mapa[r.usuario] = (mapa[r.usuario] ?? 0) + ms
    })
    return Object.entries(mapa)
      .map(([nombre, ms]) => ({ nombre: nombre.split(' ')[0], horas: parseFloat((ms / 3600000).toFixed(1)) }))
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 10)
  }, [completados])

  const porActividad = useMemo(() => {
    const mapa = {}
    completados.forEach(r => { mapa[r.actividad] = (mapa[r.actividad] ?? 0) + 1 })
    return Object.entries(mapa).map(([name, value]) => ({ name, value }))
  }, [completados])

  const porMes = useMemo(() => {
    const meses = {}
    completados.forEach(r => {
      const mes = new Date(r.entrada).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      meses[mes] = (meses[mes] ?? 0) + (new Date(r.salida) - new Date(r.entrada)) / 3600000
    })
    return Object.entries(meses).slice(-6).map(([mes, h]) => ({ mes, horas: parseFloat(h.toFixed(1)) }))
  }, [completados])

  const totalHoras = useMemo(() => {
    const ms = completados.reduce((a, r) => a + (new Date(r.salida) - new Date(r.entrada)), 0)
    return Math.floor(ms / 3600000)
  }, [completados])

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const futuros = servicios.filter(s => new Date(s.fecha) >= hoy)
  const pasados = servicios.filter(s => new Date(s.fecha) <  hoy).reverse()

  async function crearEvento(e) {
    e.preventDefault()
    const { error } = await supabase.from('servicios').insert([{ ...nuevoEvento, equipo: [], candidatos: [] }])
    if (!error) {
      setModalOpen(false)
      setNuevoEvento({ titulo: '', fecha: '', hora: '', descripcion: '' })
      cargarTodo()
      Swal.fire({ icon: 'success', title: 'Servicio creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    }
  }

  async function borrarEvento(id) {
    const { isConfirmed } = await Swal.fire({ title: '¿Borrar servicio?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar' })
    if (!isConfirmed) return
    await supabase.from('servicios').delete().eq('id', id)
    cargarTodo()
  }

  async function cambiarEstadoIncidencia(id, nuevoEstado) {
    const { error } = await supabase.from('incidencias').update({ estado: nuevoEstado }).eq('id', id)
    if (!error) {
      Swal.fire({ icon: 'success', title: 'Incidencia Archivada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
      cargarTodo()
    }
  }

  async function borrarIncidencia(id) {
    const { isConfirmed } = await Swal.fire({ 
      title: '¿Rechazar y eliminar?', 
      text: "La incidencia se borrará por completo de la base de datos y no quedará registro.",
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar', 
      cancelButtonText: 'Cancelar' 
    })
    if (!isConfirmed) return

    const { error } = await supabase.from('incidencias').delete().eq('id', id)
    if (!error) {
      Swal.fire({ icon: 'success', title: 'Incidencia eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
      cargarTodo()
    }
  }

  function compartirWhatsApp(inc) {
    const enlaceMapa = inc.coordenadas ? `%0A🗺️ *Mapa:* https://www.google.com/maps?q=${inc.coordenadas}` : ''
    const texto = `⚠️ *AVISO CIUDADANO* ⚠️%0A%0A🗂️ *Tipo:* ${inc.tipo}%0A📍 *Ubicación:* ${inc.ubicacion_texto}%0A📝 *Detalles:* ${inc.descripcion}${enlaceMapa}`
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank')
  }

  async function publicarAnuncio(e) {
    e.preventDefault()
    setGuardandoAnuncio(true)
    
    // 3. ENVIAMOS EL ICONO A LA BASE DE DATOS
    const { error } = await supabase.from('anuncios')
      .upsert({ id: 1, mensaje: anuncio.mensaje, tipo: anuncio.tipo, icono: anuncio.icono, created_at: new Date() })
    
    setGuardandoAnuncio(false)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire({ icon: 'success', title: 'Tablón actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
  }

  async function publicarAlerta(e) {
    e.preventDefault()
    setGuardandoAlerta(true)
    const { error } = await supabase.from('alerta_publica')
      .upsert({ id: 1, mensaje: alertaPublica.mensaje, color: alertaPublica.color, icono: alertaPublica.icono, activa: true, created_at: new Date() })
    setGuardandoAlerta(false)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire({ icon: 'success', title: '✅ Web pública actualizada', text: 'El aviso ya es visible para los vecinos.', confirmButtonColor: '#003366' })
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  const TABS = [
    { id: 'operativo', label: 'Operativo',    icon: '🚨' },
    { id: 'stats',     label: 'Estadísticas', icon: '📊' },
    { id: 'historial', label: 'Historial',    icon: '📂' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />

      <div className="bg-pc-blue pb-6 pt-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Jefatura</p>
              <p className="text-blue-200 text-sm mt-0.5">Hola, {perfil?.nombre?.split(' ')[0]}</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link to="/admin/partes"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl text-sm transition border border-white/20">
                📁 Libro Partes
              </Link>
              <Link to="/admin/mapa"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl text-sm transition border border-white/20">
                🗺️ Editor Mapa
              </Link>
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 bg-pc-orange hover:bg-pc-orange-dark text-white font-bold py-2 px-4 rounded-xl text-sm transition shadow-orange">
                ＋ Nuevo Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-1 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KPI icon="🎖️" valor={completados.length} label="Servicios totales" color="text-pc-blue" />
          <KPI icon="⏱️" valor={`${totalHoras}h`} label="Horas acumuladas" color="text-purple-600" />
          <KPI icon="👥" valor={usuarios.length} label="Voluntarios" color="text-green-600" />
          <KPI icon="⚠️" valor={incidenciasPendientes.length} label="Avisos pendientes" color="text-red-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          
          {/* 4. MODIFICAMOS EL DISEÑO DE LA MEGAFONÍA PARA QUE SEA IGUAL A LA ALERTA */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <h3 className="font-bold text-indigo-900 text-sm mb-0.5 flex items-center gap-2">📢 Megafonía Voluntarios</h3>
            <p className="text-xs text-indigo-400 mb-3">Visible en el Dashboard de todos los voluntarios</p>
            <form onSubmit={publicarAnuncio} className="flex flex-col gap-2">
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Desplegable de Iconos Internos */}
                <select value={anuncio.icono} onChange={e => setAnuncio(a => ({ ...a, icono: e.target.value }))}
                  className="w-full sm:w-auto px-3 py-2 border border-indigo-200 rounded-xl text-sm bg-white focus:outline-none font-medium">
                  <option value="📢">📢 Info</option>
                  <option value="⚠️">⚠️ Atención</option>
                  <option value="🎯">🎯 Objetivo</option>
                  <option value="🛠️">🛠️ Tareas</option>
                  <option value="📅">📅 Evento</option>
                  <option value="🏆">🏆 Logro</option>
                  <option value="🚨">🚨 Urgente</option>
                </select>

                {/* Desplegable de Colores */}
                <select value={anuncio.tipo} onChange={e => setAnuncio(a => ({ ...a, tipo: e.target.value }))}
                  className="w-full sm:w-36 px-3 py-2 border border-indigo-200 rounded-xl text-sm bg-white focus:outline-none font-medium">
                  <option value="verde">🟢 Verde</option>
                  <option value="azul">🔵 Azul</option>
                  <option value="amarillo">🟡 Amarillo</option>
                  <option value="naranja">🟠 Naranja</option>
                  <option value="rojo">🔴 Rojo</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" required value={anuncio.mensaje}
                  onChange={e => setAnuncio(a => ({ ...a, mensaje: e.target.value }))}
                  placeholder="Mensaje para el equipo..."
                  className="flex-1 px-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <Button type="submit" loading={guardandoAnuncio} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap text-sm px-4">
                  Publicar
                </Button>
              </div>

            </form>
          </div>

          {/* Tarjeta de Alerta Población (se queda igual) */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <h3 className="font-bold text-red-900 text-sm mb-0.5 flex items-center gap-2">🚨 Alerta Población</h3>
            <p className="text-xs text-red-400 mb-3">Visible en la <strong>web pública</strong> para los vecinos</p>
            <form onSubmit={publicarAlerta} className="flex flex-col gap-2">
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={alertaPublica.icono} onChange={e => setAlertaPublica(a => ({ ...a, icono: e.target.value }))}
                  className="w-full sm:w-auto px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none font-medium">
                  <option value="📢">📢 Info</option>
                  <option value="⚠️">⚠️ Atención</option>
                  <option value="🌡️">🌡️ Calor</option>
                  <option value="❄️">❄️ Frío / Nieve</option>
                  <option value="🌧️">🌧️ Lluvia</option>
                  <option value="🔥">🔥 Incendio</option>
                  <option value="🚧">🚧 Obras / Corte</option>
                  <option value="🌪️">🌪️ Viento</option>
                </select>

                <select value={alertaPublica.color} onChange={e => setAlertaPublica(a => ({ ...a, color: e.target.value }))}
                  className="w-full sm:w-36 px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none font-medium">
                  <option value="verde">🟢 Verde</option>
                  <option value="azul">🔵 Azul</option>
                  <option value="amarillo">🟡 Amarillo</option>
                  <option value="naranja">🟠 Naranja</option>
                  <option value="rojo">🔴 Rojo</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" required value={alertaPublica.mensaje}
                  onChange={e => setAlertaPublica(a => ({ ...a, mensaje: e.target.value }))}
                  placeholder="Ej: Situación de normalidad..."
                  className="flex-1 px-3 py-2 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                <Button type="submit" loading={guardandoAlerta} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white whitespace-nowrap text-sm px-4">
                  Actualizar
                </Button>
              </div>

            </form>
          </div>
        </div>

        {/* 2. Contenedor de Pestañas con scroll adaptativo para móviles */}
        <div className="flex bg-white border border-gray-200 p-1 rounded-2xl shadow-sm mb-4 w-full sm:w-fit overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-sm font-bold transition whitespace-nowrap shrink-0 sm:shrink
                ${tab === t.id ? 'bg-pc-blue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
              <span className="text-sm md:text-base">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: OPERATIVO ══════════════════════════════════════ */}
        {tab === 'operativo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* COLUMNA REPORTES CIUDADANOS PENDIENTES */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>📸</span> Reportes de Vecinos 
                  {incidenciasPendientes.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{incidenciasPendientes.length}</span>}
                </h3>
              </div>

              {incidenciasPendientes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 italic">
                  No hay incidencias pendientes de revisión
                </div>
              ) : (
                incidenciasPendientes.map(inc => (
                  <div key={inc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 border-t-4 border-t-red-500 space-y-2.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-gray-800 bg-red-50 text-red-700 px-2 py-0.5 rounded-md text-[10px] uppercase">{inc.tipo}</span>
                      <span className="text-[10px] text-gray-400 font-medium">⏱️ {new Date(inc.creado_el).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">📍 Ubicación:</p>
                      <p className="text-gray-600 italic bg-gray-50 p-2 rounded-lg mt-0.5">{inc.ubicacion_texto}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">📝 Descripción:</p>
                      <p className="text-gray-600 font-medium">{inc.descripcion}</p>
                    </div>
                    <div className="pt-1 text-[10px] text-gray-400 flex flex-col gap-0.5 border-t border-gray-50">
                      <p>👤 <strong>Informante:</strong> {inc.nombre_ciudadano}</p>
                      <p>📞 <strong>Teléfono:</strong> <a href={`tel:${inc.telefono_ciudadano}`} className="text-blue-600 underline font-semibold">{inc.telefono_ciudadano}</a></p>
                      
                      {/* BOTÓN GOOGLE MAPS EN LA INTRANET */}
                      {inc.coordenadas ? (
                        <div className="pt-1">
                          <a 
                            href={`https://www.google.com/maps?q=${inc.coordenadas}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md font-bold hover:bg-blue-100 transition text-[10px]"
                          >
                            🗺️ Ver en Google Maps
                          </a>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic pt-1">📍 No se marcaron coordenadas en el mapa</p>
                      )}
                    </div>
                    
                    {/* BOTONES DE ACCIÓN */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2">
                      <button onClick={() => compartirWhatsApp(inc)} className="bg-[#25D366] text-white py-1.5 rounded-lg font-bold hover:bg-[#20bd5a] transition text-[10px] flex items-center justify-center gap-1">
                        💬 Enviar
                      </button>
                      <button onClick={() => cambiarEstadoIncidencia(inc.id, 'Archivada')} className="bg-gray-100 text-gray-600 border border-gray-200 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition text-[10px]">
                        📂 Archivar
                      </button>
                      <button onClick={() => borrarIncidencia(inc.id)} className="bg-red-50 text-red-600 border border-red-200 py-1.5 rounded-lg font-bold hover:bg-red-100 transition text-[10px]">
                        🗑️ Rechazar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* COLUMNA PRÓXIMOS SERVICIOS (Toma las 2/3 partes restantes) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">📅 Próximos Servicios Planificados</h3>
              {futuros.length === 0 ? (
                <EmptyState icon="📭" title="No hay servicios próximos"
                  description="Crea el primero con el botón de arriba."
                  action={
                    <button onClick={() => setModalOpen(true)}
                      className="mt-4 bg-pc-orange text-white font-bold px-5 py-2 rounded-xl hover:bg-pc-orange-dark transition">
                      ＋ Nuevo Evento
                    </button>
                  }
                />
              ) : futuros.map(ev => (
                <TarjetaServicio key={ev.id} evento={ev} usuarios={usuarios}
                  esHistorial={false} onBorrar={borrarEvento} onRefresh={cargarTodo} />
              ))}
            </div>

          </div>
        )}

        {/* ══ TAB: ESTADÍSTICAS ═══════════════════════════════════ */}
        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700">🏆 Ranking de Voluntarios</h3>
                  <Badge variant="blue">Total acumulado</Badge>
                </div>
                {ranking.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Sin registros aún</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ranking} layout="vertical" margin={{ left: 8, right: 24 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                      <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12 }} width={72} />
                      <Tooltip formatter={v => [`${v}h`, 'Horas']} />
                      <Bar dataKey="horas" fill="#003366" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h3 className="font-bold text-gray-700 mb-4">🎯 Por Tipo de Actividad</h3>
                {porActividad.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Sin registros aún</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={porActividad} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {porActividad.map((e, i) => (
                          <Cell key={e.name} fill={COLOR_ACT[e.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            <Card>
              <h3 className="font-bold text-gray-700 mb-4">📅 Actividad mensual (últimos 6 meses)</h3>
              {porMes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin datos suficientes</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={porMes}>
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="h" />
                    <Tooltip formatter={v => [`${v}h`, 'Horas']} />
                    <Bar dataKey="horas" fill="#FF6600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-gray-700 mb-4">🕒 Últimos registros</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {registros.slice(0, 30).map(r => {
                  const durMs = new Date(r.salida) - new Date(r.entrada)
                  const h = Math.floor(durMs / 3600000)
                  const m = Math.floor((durMs % 3600000) / 60000)
                  const DOT = Object.fromEntries(ACTIVIDADES.map(a => [a.value, a.dot]))
                  return (
                    <div key={r.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[r.actividad] ?? 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-gray-700">{r.usuario}</p>
                          <p className="text-gray-400">{r.actividad} · {new Date(r.entrada).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 font-medium">{h}h {m}m</span>
                    </div>
                  )
                })}
                {registros.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin registros</p>}
              </div>
            </Card>
          </div>
        )}

        {/* ══ TAB: HISTORIAL ══════════════════════════════════════ */}
        {tab === 'historial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMNA 1: SERVICIOS PASADOS */}
            <div>
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-4">📂 Historial de Servicios</h3>
              {pasados.length === 0 ? (
                <EmptyState icon="📂" title="Sin historial" description="Los eventos pasados aparecerán aquí." />
              ) : (
                <div className="space-y-4 opacity-80">
                  {pasados.map(ev => (
                    <TarjetaServicio key={ev.id} evento={ev} usuarios={usuarios}
                      esHistorial={true} onBorrar={borrarEvento} onRefresh={cargarTodo} />
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA 2: REPORTES CIUDADANOS ARCHIVADOS */}
            <div>
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-4">🗄️ Avisos Ciudadanos Archivados</h3>
              {incidenciasArchivadas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 italic">
                  No hay incidencias en el archivo
                </div>
              ) : (
                <div className="space-y-4 opacity-75">
                  {incidenciasArchivadas.map(inc => (
                    <div key={inc.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-xs">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-bold text-gray-600 uppercase">{inc.tipo}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(inc.creado_el).toLocaleDateString('es-ES')}</span>
                      </div>
                      <p className="text-gray-500 italic mb-1.5">{inc.ubicacion_texto}</p>
                      <p className="text-gray-500">{inc.descripcion}</p>
                      <div className="pt-2 mt-2 border-t border-gray-100 text-[10px] flex justify-between items-center">
                        <span className="text-gray-400">👤 {inc.nombre_ciudadano}</span>
                        <button onClick={() => borrarIncidencia(inc.id)} className="text-red-400 hover:text-red-600 transition font-bold">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modal nuevo evento */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-pc-blue px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Nuevo Servicio</h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-pc-orange text-xl font-bold">✕</button>
            </div>
            <form onSubmit={crearEvento} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del evento</label>
                <input type="text" required placeholder="Ej: Cabalgata de Reyes"
                  value={nuevoEvento.titulo} onChange={e => setNuevoEvento(n => ({ ...n, titulo: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                  <input type="date" required value={nuevoEvento.fecha}
                    onChange={e => setNuevoEvento(n => ({ ...n, fecha: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                  <input type="time" required value={nuevoEvento.hora}
                    onChange={e => setNuevoEvento(n => ({ ...n, hora: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción / Ubicación</label>
                <textarea rows={2} placeholder="Detalles importantes..."
                  value={nuevoEvento.descripcion} onChange={e => setNuevoEvento(n => ({ ...n, descripcion: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2">Cancelar</button>
                <Button type="submit" variant="secondary">Crear Evento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}