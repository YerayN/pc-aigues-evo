import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input } from '../../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Redirigir a la página original si venía de una ruta protegida
  const destino = location.state?.from?.pathname ?? '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate(destino, { replace: true })
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pc-blue md:bg-gray-100 flex flex-col">
      {/* Nav mínima */}
      <nav className="bg-pc-blue py-4 px-6 flex justify-between items-center shrink-0">
        <Link to="/" className="text-white font-bold tracking-wider text-sm">
          PROTECCIÓN CIVIL <span className="text-pc-orange">AIGÜES</span>
        </Link>
        <Link to="/" className="text-blue-300 hover:text-white text-sm transition flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl flex overflow-hidden w-full max-w-4xl">

          {/* Panel izquierdo — solo desktop */}
          <div className="hidden md:flex w-1/2 bg-pc-blue relative flex-col justify-end p-10 overflow-hidden min-h-[480px]">
            <img src="/fondo_hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="relative z-10">
              <p className="text-pc-orange text-xs font-bold uppercase tracking-widest mb-2">Intranet</p>
              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">Gestión Interna</h2>
              <p className="text-blue-200 text-sm leading-relaxed">
                Acceso restringido a voluntarios y personal autorizado de la agrupación de Aigües.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-pc-blue mb-1">Iniciar Sesión</h1>
              <p className="text-gray-500 text-sm">Introduce tus credenciales de voluntario</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoFocus
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Entrar al sistema
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              <button className="hover:text-pc-orange transition">
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
