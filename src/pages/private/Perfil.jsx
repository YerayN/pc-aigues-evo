import { useState, useEffect } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui'
import Swal from 'sweetalert2'

const ROL_LABEL = { admin: 'Administrador del Sistema', jefe: 'Jefe de Agrupación', voluntario: 'Voluntario' }

export default function Perfil() {
  const { perfil: perfilCtx, rol, esJefe } = useAuth()
  const [form,    setForm]    = useState({ nombre: '', dni: '', telefono: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (perfilCtx) {
      setForm({ nombre: perfilCtx.nombre ?? '', dni: perfilCtx.dni ?? '', telefono: perfilCtx.telefono ?? '' })
    }
  }, [perfilCtx])

  const fechaAlta = perfilCtx?.created_at
    ? new Date(perfilCtx.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  async function guardar() {
    setLoading(true)
    const { error } = await supabase.from('perfiles').update(form).eq('id', perfilCtx.id)
    setLoading(false)
    if (!error) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
        .fire({ icon: 'success', title: '¡Datos actualizados!' })
    } else {
      Swal.fire('Error', error.message, 'error')
    }
  }

  const Field = ({ label, icon, value, onChange, readOnly = false, mono = false }) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">{icon}</span>
        <input
          type="text" value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition outline-none
            ${readOnly
              ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-pc-orange focus:border-transparent'
            } ${mono ? 'font-mono' : ''}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
          {readOnly ? '🔒' : '✏️'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />
      <main className="container mx-auto px-4 py-6 max-w-xl">
        <div className="bg-white rounded-2xl shadow-pc overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-gradient-to-br from-pc-blue to-blue-800 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg border-4 border-pc-orange mb-4">
                👤
              </div>
              <h1 className="text-xl font-bold text-white">{perfilCtx?.nombre ?? '—'}</h1>
              <p className="text-blue-200 text-xs uppercase tracking-widest mt-1">
                {ROL_LABEL[rol] ?? 'Voluntario'}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              <span className="text-lg shrink-0">🔒</span>
              <p>Datos oficiales. {esJefe ? 'Como jefe puedes modificarlos directamente.' : 'Si hay algún error, contacta con Coordinación.'}</p>
            </div>

            <Field label="Nombre completo" icon="📝"
              value={form.nombre}
              onChange={esJefe ? v => setForm(f => ({ ...f, nombre: v })) : null}
              readOnly={!esJefe}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="DNI / TIP" icon="🪪" mono
                value={form.dni}
                onChange={esJefe ? v => setForm(f => ({ ...f, dni: v })) : null}
                readOnly={!esJefe}
              />
              <Field label="Teléfono" icon="📞" mono
                value={form.telefono}
                onChange={esJefe ? v => setForm(f => ({ ...f, telefono: v })) : null}
                readOnly={!esJefe}
              />
            </div>

            <Field label="Fecha de alta" icon="📅" value={fechaAlta} readOnly />

            {esJefe && (
              <Button onClick={guardar} loading={loading} variant="secondary" size="lg" className="w-full">
                💾 Guardar Modificaciones
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
