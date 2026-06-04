import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlertaPublica } from '../../hooks/useSupabase'

// 🎨 NUEVOS ESTILOS DE ALTO IMPACTO (Degradados y bordes gruesos)
const ESTILOS_ALERTA = {
  verde:    'bg-gradient-to-r from-green-500 to-green-600 text-white border-b-4 border-green-700',
  azul:     'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-4 border-blue-900',
  amarillo: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-b-4 border-yellow-600',
  naranja:  'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-4 border-orange-700',
  rojo:     'bg-gradient-to-r from-red-600 to-red-700 text-white border-b-4 border-red-900',
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
    ? (ESTILOS_ALERTA[alerta.color] ?? ESTILOS_ALERTA.azul)
    : null

  const cerrar = () => setMenuAbierto(false)

  return (
    <>
      {/* 🚨 NUEVO PANEL DE ALERTA DE ALTO IMPACTO 🚨 */}
      {alerta?.activa && (
        <div className={`w-full shadow-lg relative z-50 overflow-hidden ${claseAlerta} ${alerta.color === 'rojo' ? 'animate-pulse' : ''}`}>
          
          {/* Patrón de rayas diagonales semitransparente (estilo emergencia) */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}
          />
          
          <div className="container mx-auto px-4 py-3 md:py-4 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center sm:text-left">
            
            {/* Icono gigante */}
            <div className="text-4xl md:text-5xl drop-shadow-md pb-1 sm:pb-0 shrink-0">
              {alerta.icono || '📢'}
            </div>
            
            {/* Textos */}
            <div className="flex flex-col justify-center max-w-4xl">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80 mb-0.5">
                Aviso Oficial · Protección Civil
              </span>
              <span className="text-sm md:text-lg font-bold leading-tight drop-shadow-sm">
                {alerta.mensaje}
              </span>
            </div>
            
          </div>
        </div>
      )}

      {/* ── BARRA DE NAVEGACIÓN NORMAL ── */}
      <nav className="bg-pc-blue text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">

          {/* Logo */}
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

          {/* Desktop nav */}
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

          {/* Hamburger móvil */}
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

        {/* Menú móvil desplegable */}
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