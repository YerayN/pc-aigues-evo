import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '../../hooks/useSupabase'

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

  const COLORES_TABLON = {
    info:    'bg-pc-blue text-white',
    aviso:   'bg-yellow-400 text-gray-900',
    urgente: 'bg-red-600 text-white animate-pulse',
  }

  return (
    <>
      {anuncio?.mensaje && (
        <div className={`w-full py-2 px-4 text-center text-sm font-bold ${COLORES_TABLON[anuncio.tipo] ?? 'bg-pc-blue text-white'} transition-all`}>
          {anuncio.tipo === 'urgente' ? '🚨' : anuncio.tipo === 'aviso' ? '🔔' : '📢'} {anuncio.mensaje}
        </div>
      )}

      <nav className="bg-pc-blue text-white shadow-lg sticky top-0 z-50">
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
