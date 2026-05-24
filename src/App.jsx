import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { lazy, Suspense } from 'react'
import { LoadingPage } from './components/ui'

const Home       = lazy(() => import('./pages/public/Home'))
const Reportar   = lazy(() => import('./pages/public/Reportar'))
const Login      = lazy(() => import('./pages/public/Login'))

const Dashboard  = lazy(() => import('./pages/private/Dashboard'))
const Calendario = lazy(() => import('./pages/private/Calendario'))
const Partes     = lazy(() => import('./pages/private/Partes'))
const Documentos = lazy(() => import('./pages/private/Documentos'))
const Inventario = lazy(() => import('./pages/private/Inventario'))
const Fichaje    = lazy(() => import('./pages/private/Fichaje'))
const Perfil     = lazy(() => import('./pages/private/Perfil'))
const Stats      = lazy(() => import('./pages/private/Stats'))

const Gestion    = lazy(() => import('./pages/admin/Gestion'))
const AdminMapa  = lazy(() => import('./pages/admin/AdminMapa'))
const AdminPartes = lazy(() => import('./pages/admin/AdminPartes'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/reportar" element={<Reportar />} />
            <Route path="/login"    element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/partes"     element={<Partes />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/fichaje"    element={<Fichaje />} />
              <Route path="/perfil"     element={<Perfil />} />
              <Route path="/stats"      element={<Stats />} />
              <Route path="/chat"       element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route element={<ProtectedRoute rolRequerido="jefe" />}>
              <Route path="/gestion"      element={<Gestion />} />
              <Route path="/admin/mapa"   element={<AdminMapa />} />
              <Route path="/admin/partes" element={<AdminPartes />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
