import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlertaPublica } from '../../hooks/useSupabase'

const COLORES_ALERTA = {
  verde:    'bg-green-600 text-white',
  azul:     'bg-blue-700 text-white',
  amarillo: 'bg-yellow-400 text-gray-900',
  naranja:  'bg-orange-500 text-white',
  rojo:     'bg-red-600 text-white animate-pulse',
}

// Scroll suave a una sección de la Home
function scrollToSection(id, navigate, cerrarMenu) {
  cerrarMenu?.()
  if (window.location.pathname === '/') {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    navigate('/')
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }
}

export default function NavBarPublica() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { alerta } = useAlertaPublica()
  const navigate = useNavigate()

  const claseAlerta = alerta?.activa
    ? (COLORES_ALERTA[alerta.color] ?? 'bg-gray-600 text-white')
    : null

  const cerrar = () => setMenuAbierto(false)

  return (
    <>
      {/* Barra de alerta pública (Supabase Realtime) */}
      {alerta?.activa && (
        <div className={`w-full py-2.5 px-4 text-center text-sm font-bold ${claseAlerta} transition-all duration-500`}>
          {alerta.icono || '📢'}&nbsp;&nbsp;{alerta.mensaje}
        </div>
      )}

      <nav className="bg-pc-blue text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition shrink-0">
            <div className="w-12 h-12 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/escudo.png"
                alt="PC Aigües"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Protección Civil</p>
              <p className="text-[11px] text-pc-orange font-bold tracking-widest uppercase">Aigües</p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => scrollToSection('mapa', navigate, cerrar)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-pc-orange transition text-sm"
            >
              Mapa
            </button>
            <button
              onClick={() => scrollToSection('voluntarios', navigate, cerrar)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-pc-orange transition text-sm"
            >
              Únete
            </button>
            <Link
              to="/reportar"
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-pc-orange transition text-sm"
            >
              Reportar
            </Link>
            <Link
              to="/login"
              className="ml-2 bg-pc-orange hover:bg-pc-orange-dark px-5 py-2 rounded-xl font-bold transition text-white text-sm"
            >
              Intranet →
            </Link>
          </div>

          {/* ── Hamburger móvil ── */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* ── Menú móvil desplegable ── */}
        {menuAbierto && (
          <div className="md:hidden border-t border-white/10 bg-pc-blue">
            <button
              onClick={() => scrollToSection('mapa', navigate, cerrar)}
              className="w-full text-left px-5 py-4 text-sm hover:bg-white/10 transition border-b border-white/5"
            >
              🗺️ &nbsp; Mapa de incidencias
            </button>
            <button
              onClick={() => scrollToSection('voluntarios', navigate, cerrar)}
              className="w-full text-left px-5 py-4 text-sm hover:bg-white/10 transition border-b border-white/5"
            >
              🤝 &nbsp; Únete como voluntario
            </button>
            <Link
              to="/reportar"
              onClick={cerrar}
              className="block px-5 py-4 text-sm hover:bg-white/10 transition border-b border-white/5"
            >
              📸 &nbsp; Reportar incidencia
            </Link>
            <Link
              to="/login"
              onClick={cerrar}
              className="block px-5 py-4 text-sm font-bold bg-pc-orange/20 hover:bg-pc-orange transition"
            >
              🔐 &nbsp; Acceso Intranet
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}