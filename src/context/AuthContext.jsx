import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)
  const inicializado = useRef(false)

  const rol    = perfil?.rol ?? null
  const esJefe  = rol === 'admin' || rol === 'jefe'
  const esAdmin = rol === 'admin'

  async function cargarPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) console.error('Error cargando perfil:', error.message)
      setPerfil(data ?? null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false)
    }, 8000)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error(error.message)
      if (!inicializado.current) {
        inicializado.current = true
        setUser(session?.user ?? null)
        if (session?.user) cargarPerfil(session.user.id)
        else setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!inicializado.current) return
      setUser(session?.user ?? null)
      if (session?.user) cargarPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setPerfil(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, rol, loading, esJefe, esAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
