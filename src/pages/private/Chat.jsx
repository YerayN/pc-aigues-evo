import { useState, useRef, useEffect } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../hooks/useSupabase'

const CANALES = [
  { id: 'general',   label: 'General',   icon: '💬' },
  { id: 'operativo', label: 'Operativo', icon: '🚑' },
  { id: 'logistica', label: 'Logística', icon: '📦' },
  { id: 'jefatura',  label: 'Jefatura',  icon: '⭐', soloJefe: true },
]

function formatHora(ts) {
  return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const { perfil, esJefe } = useAuth()
  const [canalActivo, setCanalActivo] = useState('general')
  const [texto, setTexto] = useState('')
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const { mensajes, enviar, noLeidos, marcarLeidos } = useChat(canalActivo)

  // Scroll al último mensaje y marcar como leídos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    marcarLeidos()
  }, [mensajes])

  async function handleEnviar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    await enviar(texto, perfil?.nombre)
    setTexto('')
    inputRef.current?.focus()
  }

  function cambiarCanal(id) {
    setCanalActivo(id)
    setSidebarAbierto(false)
  }

  const canalesVisibles = CANALES.filter(c => !c.soloJefe || esJefe)
  const canalInfo = canalesVisibles.find(c => c.id === canalActivo)

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <NavBarIntranet />

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar canales (desktop siempre visible, móvil overlay) ── */}
        <>
          {/* Overlay móvil */}
          {sidebarAbierto && (
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setSidebarAbierto(false)}
            />
          )}

          <aside className={`
            fixed md:static inset-y-0 left-0 z-40 md:z-auto
            w-56 bg-white border-r border-gray-100 shadow-lg md:shadow-none
            flex flex-col transition-transform duration-300
            ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
            style={{ top: 'var(--navbar-h, 0)' }}
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                Canales
              </p>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {canalesVisibles.map(c => (
                <button
                  key={c.id}
                  onClick={() => cambiarCanal(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${canalActivo === c.id
                      ? 'bg-pc-blue text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </>

        {/* ── Área principal ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Header del canal */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
            {/* Botón abrir sidebar en móvil */}
            <button
              onClick={() => setSidebarAbierto(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-xl">{canalInfo?.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-800 text-sm leading-none">{canalInfo?.label}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{mensajes.length} mensajes</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              En vivo
            </span>
          </div>

          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {mensajes.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">Sé el primero en escribir</p>
              </div>
            )}

            {mensajes.map((msg, i) => {
              const esMio       = msg.autor === perfil?.nombre
              const mostrarNombre = i === 0 || mensajes[i - 1]?.autor !== msg.autor

              return (
                <div key={msg.id ?? i} className={`flex gap-2 ${esMio ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {mostrarNombre
                    ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto
                        ${esMio ? 'bg-pc-orange text-white' : 'bg-pc-blue text-white'}`}>
                        {msg.autor?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    )
                    : <div className="w-7 shrink-0" />
                  }

                  <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                    {mostrarNombre && (
                      <span className="text-[10px] font-semibold text-gray-400 mb-0.5 px-1">
                        {esMio ? 'Tú' : msg.autor}
                      </span>
                    )}
                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-snug break-words
                      ${esMio
                        ? 'bg-pc-blue text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                      {msg.texto}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                      {formatHora(msg.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleEnviar}
            className="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0 bg-white"
          >
            <input
              ref={inputRef}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder={`Mensaje en #${canalActivo}...`}
              maxLength={500}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-blue focus:border-transparent outline-none transition"
            />
            <button
              type="submit"
              disabled={!texto.trim()}
              className="px-4 py-2.5 bg-pc-blue hover:bg-pc-blue-dark disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold text-sm transition active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
