import { useState, useEffect, useCallback } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LoadingPage, EmptyState, Button } from '../../components/ui'
import Swal from 'sweetalert2'

const CATS = [
  { id: 'todos',      label: 'Todos' },
  { id: 'protocolos', label: 'Protocolos' },
  { id: 'guias',      label: 'Guías' },
  { id: 'normativa',  label: 'Normativa' },
]

const CAT_STYLE = {
  protocolos: 'bg-red-50 text-red-600 border-red-100',
  guias:      'bg-blue-50 text-blue-600 border-blue-100',
  normativa:  'bg-yellow-50 text-yellow-600 border-yellow-100',
}

function icono(doc) {
  if (doc.url_archivo?.includes('drive.google')) return '☁️'
  if (doc.url_archivo?.includes('dropbox'))      return '📦'
  if (doc.url_archivo?.endsWith('.pdf'))         return '📕'
  if (doc.categoria === 'normativa')             return '⚖️'
  return '📄'
}

export default function Documentos() {
  const { esJefe } = useAuth()
  const [docs,     setDocs]     = useState([])
  const [filtro,   setFiltro]   = useState('todos')
  const [loading,  setLoading]  = useState(true)
  const [nuevo,    setNuevo]    = useState({ titulo: '', categoria: 'protocolos', url: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('documentos').select('*').order('created_at', { ascending: false })
    setDocs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const visibles = filtro === 'todos' ? docs : docs.filter(d => d.categoria === filtro)

  async function guardarDoc(e) {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('documentos').insert([{ titulo: nuevo.titulo, categoria: nuevo.categoria, url_archivo: nuevo.url }])
    setGuardando(false)
    if (!error) {
      setNuevo({ titulo: '', categoria: 'protocolos', url: '' })
      cargar()
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }).fire({ icon: 'success', title: 'Documento guardado' })
    } else { Swal.fire('Error', error.message, 'error') }
  }

  async function borrar(id) {
    const { isConfirmed } = await Swal.fire({ title: '¿Eliminar documento?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar' })
    if (!isConfirmed) return
    await supabase.from('documentos').delete().eq('id', id)
    cargar()
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />
      <main className="container mx-auto px-4 py-6 max-w-5xl">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📂 Documentación</h1>
            <p className="text-sm text-gray-500 mt-1">Biblioteca digital de protocolos y guías</p>
          </div>

          {/* Filtros */}
          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto w-full sm:w-auto">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setFiltro(c.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition whitespace-nowrap
                  ${filtro === c.id ? 'bg-pc-blue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel subir (solo jefe) */}
        {esJefe && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 md:p-5">
            <h3 className="font-bold text-pc-blue mb-3 text-sm">🔗 Añadir Nuevo Enlace</h3>
            <form onSubmit={guardarDoc} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <input type="text" required placeholder="Título del documento"
                value={nuevo.titulo} onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))}
                className="sm:col-span-1 px-3 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pc-blue" />
              <select value={nuevo.categoria} onChange={e => setNuevo(n => ({ ...n, categoria: e.target.value }))}
                className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none">
                <option value="protocolos">Protocolo</option>
                <option value="guias">Guía / Manual</option>
                <option value="normativa">Normativa</option>
              </select>
              <input type="url" required placeholder="https://drive.google.com/..."
                value={nuevo.url} onChange={e => setNuevo(n => ({ ...n, url: e.target.value }))}
                className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pc-blue" />
              <Button type="submit" loading={guardando} variant="secondary" className="w-full">
                💾 Guardar
              </Button>
            </form>
          </div>
        )}

        {/* Grid documentos */}
        {visibles.length === 0 ? (
          <EmptyState icon="📂" title="No hay documentos" description="Esta categoría está vacía." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibles.map(doc => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl shadow-pc border border-gray-100 hover:shadow-pc-lg transition flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{icono(doc)}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${CAT_STYLE[doc.categoria] ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    {doc.categoria}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 group-hover:text-pc-blue transition">
                  {doc.titulo}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {new Date(doc.created_at).toLocaleDateString('es-ES')}
                </p>
                <div className="mt-auto flex gap-2">
                  <a href={doc.url_archivo} target="_blank" rel="noreferrer"
                    className="flex-1 bg-gray-50 hover:bg-pc-orange hover:text-white text-gray-600 py-2 rounded-xl text-sm font-bold transition border border-gray-200 flex items-center justify-center gap-1">
                    🔗 Abrir
                  </a>
                  {esJefe && (
                    <button onClick={() => borrar(doc.id)}
                      className="px-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-400 rounded-xl transition border border-red-100">
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
