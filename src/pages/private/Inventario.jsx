import { useState, useEffect, useCallback } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LoadingPage, EmptyState, Button } from '../../components/ui'
import Swal from 'sweetalert2'

export default function Inventario() {
  const { perfil, esJefe } = useAuth()
  const miNombre = perfil?.nombre ?? ''

  const [almacen,    setAlmacen]    = useState([])
  const [prestamos,  setPrestamos]  = useState([])  // mis préstamos activos
  const [activos,    setActivos]    = useState([])  // todos los activos (jefe)
  const [loading,    setLoading]    = useState(true)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoStock,  setNuevoStock]  = useState('')

  const cargar = useCallback(async () => {
    const [{ data: items }, { data: misMios }, { data: todos }] = await Promise.all([
      supabase.from('inventario_material').select('*').order('nombre'),
      supabase.from('inventario_prestamos').select('*').eq('usuario', miNombre).eq('devuelto', false),
      esJefe ? supabase.from('inventario_prestamos').select('*').eq('devuelto', false).order('fecha_cogida', { ascending: false }) : { data: [] },
    ])
    setAlmacen(items ?? [])
    setPrestamos(misMios ?? [])
    setActivos(todos ?? [])
    setLoading(false)
  }, [miNombre, esJefe])

  useEffect(() => { cargar() }, [cargar])

  const toast = (icon, title) => Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 }).fire({ icon, title })

  async function coger(id, nombre, stock) {
    if (stock <= 0) return
    await supabase.from('inventario_material').update({ stock_disponible: stock - 1 }).eq('id', id)
    await supabase.from('inventario_prestamos').insert([{ item_id: id, nombre_item: nombre, usuario: miNombre, devuelto: false, fecha_cogida: new Date().toISOString() }])
    toast('success', `Has cogido: ${nombre}`)
    cargar()
  }

  async function devolver(idPrestamo, idMaterial) {
    await supabase.from('inventario_prestamos').update({ devuelto: true }).eq('id', idPrestamo)
    const { data: item } = await supabase.from('inventario_material').select('stock_disponible').eq('id', idMaterial).single()
    if (item) await supabase.from('inventario_material').update({ stock_disponible: item.stock_disponible + 1 }).eq('id', idMaterial)
    toast('info', 'Material devuelto')
    cargar()
  }

  async function agregarItem(e) {
    e.preventDefault()
    const stock = parseInt(nuevoStock)
    const { error } = await supabase.from('inventario_material').insert([{ nombre: nuevoNombre, stock_total: stock, stock_disponible: stock }])
    if (!error) { setNuevoNombre(''); setNuevoStock(''); cargar(); toast('success', 'Material añadido') }
    else Swal.fire('Error', error.message, 'error')
  }

  async function eliminarItem(id) {
    const { isConfirmed } = await Swal.fire({ title: '¿Eliminar artículo?', html: 'Se borrará el artículo y <b>todo su historial</b>.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar todo', cancelButtonText: 'Cancelar' })
    if (!isConfirmed) return
    await supabase.from('inventario_prestamos').delete().eq('item_id', id)
    await supabase.from('inventario_material').delete().eq('id', id)
    cargar(); toast('success', 'Artículo eliminado')
  }

  async function ajustarStock(id, total, disponible, delta) {
    if (delta < 0 && disponible <= 0) return
    await supabase.from('inventario_material').update({ stock_total: total + delta, stock_disponible: disponible + delta }).eq('id', id)
    cargar()
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Inventario de Material</h1>
          <p className="text-sm text-gray-500 mt-1">Control de material y préstamos de la agrupación</p>
        </div>

        {/* ── Mi mochila ── */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 md:p-5">
          <h2 className="font-bold text-pc-orange mb-3 flex items-center gap-2">
            🎒 Mi Mochila
            <span className="text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              A devolver
            </span>
          </h2>

          {prestamos.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-3xl mb-2">🎒</p>
              <p className="text-sm">Tu mochila está vacía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prestamos.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border-l-4 border-l-orange-500 border border-gray-100 shadow-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{p.nombre_item}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(p.fecha_cogida).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                    </p>
                  </div>
                  <button
                    onClick={() => devolver(p.id, p.item_id)}
                    className="ml-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 whitespace-nowrap shrink-0"
                  >
                    Devolver ↩
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Almacén ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-pc">
          <h2 className="font-bold text-pc-blue mb-4 flex items-center gap-2">
            🏢 Almacén
            <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Disponible</span>
          </h2>

          {almacen.length === 0 ? (
            <EmptyState icon="📦" title="Almacén vacío" description="El jefe puede añadir material desde el panel de logística." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {almacen.map(item => {
                const sinStock = item.stock_disponible <= 0
                return (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between gap-2 hover:shadow-sm transition">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📦</div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{item.nombre}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Quedan: <span className={`font-bold text-sm ${sinStock ? 'text-red-500' : 'text-blue-600'}`}>
                          {item.stock_disponible}
                        </span>
                        <span className="text-gray-300">/{item.stock_total}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => coger(item.id, item.nombre, item.stock_disponible)}
                      disabled={sinStock}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold border transition active:scale-95
                        ${sinStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                        }`}
                    >
                      {sinStock ? 'Agotado' : '✋ Coger'}
                    </button>

                    {esJefe && (
                      <div className="flex gap-1">
                        <button onClick={() => ajustarStock(item.id, item.stock_total, item.stock_disponible, -1)}
                          className="flex-1 text-[10px] text-orange-600 font-bold border border-orange-100 bg-orange-50 py-1 rounded-lg hover:bg-orange-100 transition">
                          −1
                        </button>
                        <button onClick={() => ajustarStock(item.id, item.stock_total, item.stock_disponible, +1)}
                          className="flex-1 text-[10px] text-blue-600 font-bold border border-blue-100 bg-blue-50 py-1 rounded-lg hover:bg-blue-100 transition">
                          +1
                        </button>
                        <button onClick={() => eliminarItem(item.id)}
                          className="text-[10px] text-red-500 font-bold border border-red-100 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Panel jefe ── */}
        {esJefe && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 md:p-5">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              👮 Panel de Logística
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Añadir material */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                  Dar de alta nuevo material
                </label>
                <form onSubmit={agregarItem} className="flex gap-2">
                  <input
                    type="text" required placeholder="Ej: Conos de señalización"
                    value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-blue outline-none"
                  />
                  <input
                    type="number" required placeholder="Cant." min={1}
                    value={nuevoStock} onChange={e => setNuevoStock(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-blue outline-none"
                  />
                  <button type="submit" className="bg-pc-blue text-white px-4 rounded-xl font-bold hover:bg-pc-blue-dark transition">
                    +
                  </button>
                </form>
              </div>

              {/* Material en la calle */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <label className="block text-xs font-bold text-red-500 uppercase mb-3">
                  🔍 Material sin devolver
                </label>
                {activos.length === 0 ? (
                  <p className="text-sm text-green-600 italic">Todo el material está en base ✅</p>
                ) : (
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {activos.map(p => (
                      <li key={p.id} className="text-sm flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                        <span>
                          <span className="font-bold text-gray-700">{p.usuario}</span>
                          <span className="text-gray-400"> tiene </span>
                          <span className="text-blue-600 font-bold">{p.nombre_item}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
