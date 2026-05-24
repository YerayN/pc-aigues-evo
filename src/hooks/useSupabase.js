import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useQuery(tabla, opciones = {}) {
  const { filtros = {}, orden = null, limite = null, suscribir = false } = opciones

  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const filtrosKey = JSON.stringify(filtros)
  const ordenKey   = orden ? `${orden.columna}-${orden.asc}` : 'none'

  const fetchData = useCallback(async () => {
    setLoading(true)
    let query = supabase.from(tabla).select('*')

    Object.entries(JSON.parse(filtrosKey)).forEach(([col, val]) => {
      query = query.eq(col, val)
    })

    if (orden)  query = query.order(orden.columna, { ascending: orden.asc ?? true })
    if (limite) query = query.limit(limite)

    const { data: rows, error: err } = await query

    if (err) setError(err.message)
    else { setData(rows ?? []); setError(null) }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabla, filtrosKey, ordenKey, limite])

  useEffect(() => {
    fetchData()
    if (!suscribir) return

    const channel = supabase
      .channel(`realtime-${tabla}-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => fetchData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchData, suscribir, tabla])

  return { data, loading, error, refetch: fetchData }
}

export function useFichaje(nombreUsuario) {
  const [sesionActiva, setSesionActiva] = useState(false)
  const [idSesion, setIdSesion]         = useState(null)
  const [actividadActual, setActividad] = useState('')
  const [horaEntrada, setHoraEntrada]   = useState(null)
  const [loading, setLoading]           = useState(true)

  const comprobar = useCallback(async () => {
    if (!nombreUsuario) { setLoading(false); return }
    const { data } = await supabase
      .from('registro_horas')
      .select('*')
      .eq('usuario', nombreUsuario)
      .is('salida', null)
      .maybeSingle()

    if (data) {
      setSesionActiva(true)
      setIdSesion(data.id)
      setActividad(data.actividad)
      setHoraEntrada(new Date(data.entrada))
    } else {
      setSesionActiva(false)
      setIdSesion(null)
      setActividad('')
      setHoraEntrada(null)
    }
    setLoading(false)
  }, [nombreUsuario])

  useEffect(() => { comprobar() }, [comprobar])

  async function entrar(actividad) {
    const { data, error } = await supabase
      .from('registro_horas')
      .insert([{ usuario: nombreUsuario, actividad, entrada: new Date().toISOString() }])
      .select()
      .single()
    if (!error) await comprobar()
    return { data, error }
  }

  async function salir() {
    const { error } = await supabase
      .from('registro_horas')
      .update({ salida: new Date().toISOString() })
      .eq('id', idSesion)
    if (!error) await comprobar()
    return { error }
  }

  return { sesionActiva, idSesion, actividadActual, horaEntrada, loading, refetch: comprobar, entrar, salir }
}

export function useAlertaPublica() {
  const [alerta, setAlerta] = useState(null)

  useEffect(() => {
    supabase.from('alerta_publica').select('*').eq('id', 1).single()
      .then(({ data }) => setAlerta(data))

    const channel = supabase
      .channel('alerta-publica')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerta_publica', filter: 'id=eq.1' },
        ({ new: nueva }) => setAlerta(nueva)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { alerta }
}

export function useChat(canal = 'general') {
  const [mensajes, setMensajes] = useState([])
  const [noLeidos, setNoLeidos] = useState(0)

  useEffect(() => {
    setMensajes([])
    setNoLeidos(0)

    supabase
      .from('chat_mensajes')
      .select('*')
      .eq('canal', canal)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => setMensajes(data ?? []))

    const channel = supabase
      .channel(`chat-${canal}-${Date.now()}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_mensajes', filter: `canal=eq.${canal}` },
        ({ new: msg }) => {
          setMensajes(prev => [...prev, msg])
          setNoLeidos(prev => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [canal])

  async function enviar(texto, autorNombre) {
    if (!texto.trim()) return
    await supabase.from('chat_mensajes').insert([{
      canal, texto: texto.trim(), autor: autorNombre,
    }])
  }

  function marcarLeidos() { setNoLeidos(0) }

  return { mensajes, enviar, noLeidos, marcarLeidos }
}
