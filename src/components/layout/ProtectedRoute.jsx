import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ rolRequerido = null }) {
  const { user, rol, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-pc-blue flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200 text-sm">Conectando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const permitidos = {
    admin:      ['admin'],
    jefe:       ['admin', 'jefe'],
    voluntario: ['admin', 'jefe', 'voluntario'],
  }

  if (rolRequerido && !permitidos[rolRequerido]?.includes(rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
