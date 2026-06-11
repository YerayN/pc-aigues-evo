import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '../../hooks/useSupabase'

// 🎨 ESTILOS DE ALTO IMPACTO PARA LA INTRANET
const ESTILOS_ANUNCIO = {
  verde:    'bg-gradient-to-r from-green-500 to-green-600 text-white border-b-4 border-green-700',
  azul:     'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-4 border-blue-900',
  amarillo: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-b-4 border-yellow-600',
  naranja:  'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b-4 border-orange-700',
  rojo:     'bg-gradient-to-r from-red-600 to-red-700 text-white border-b-4 border-red-900',
  // Fallbacks de seguridad por si hay datos antiguos en la BBDD
  info:     'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-4 border-blue-900',
  aviso:    'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-b-4 border-yellow-600',
  urgente:  'bg-gradient-to-r from-red-600 to-red-700 text-white border-b-4 border-red-900',
}

export default function NavBarIntranet() {
  const { perfil, esJefe, logout } = useAuth()
  const navigate = useNavigate()

  const { data: anuncios } = useQuery('anuncios', { filtros: { id: 1 }, suscribir: true })
  const anuncio = anuncios?.[0]

  const primerNombre = perfil?.nombre?.split(' ')[0] ?? 'Compañero'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const claseAnuncio = ESTILOS_ANUNCIO[anuncio?.tipo] ?? ESTILOS_ANUNCIO.azul
  const parpadeo = (anuncio?.tipo === 'rojo' || anuncio?.tipo === 'urgente') ? 'animate-pulse' : ''

  return (
    <>
      {/* 🚨 PANEL DE MEGAFONÍA INTERNA 🚨 */}
      {anuncio?.mensaje && (
        <div className={`w-full shadow-md relative z-50 overflow-hidden ${claseAnuncio} ${parpadeo}`}>
          
          {/* Patrón de rayas de emergencia */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}
          />
          
          <div className="container mx-auto px-4 py-2.5 relative z-10 flex items-center justify-center gap-3 md:gap-4 text-center sm:text-left">
            <div className="text-3xl md:text-4xl drop-shadow-md shrink-0">
              {anuncio.icono || '📢'}
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">
                Megafonía Interna
              </span>
              <span className="text-sm md:text-base font-bold leading-tight drop-shadow-sm">
                {anuncio.mensaje}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── BARRA DE NAVEGACIÓN NORMAL ── */}
      <nav className="bg-pc-blue text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">

          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shrink-0">
              <img src="/escudo.png" alt="PC" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-bold text-sm block">Hola, {primerNombre}</span>
              <span className="text-[10px] text-blue-300 uppercase tracking-wider">
                {esJefe ? 'Coordinador Jefe' : 'Voluntario'}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className="hidden sm:block text-xs font-medium text-blue-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
            >
              Inicio
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
              title="Cerrar sesión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium">Salir</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}