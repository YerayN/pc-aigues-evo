import { useState, useEffect } from 'react'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui'
import Swal from 'sweetalert2'

const ROL_LABEL = { admin: 'Administrador del Sistema', jefe: 'Jefe de Agrupación', voluntario: 'Voluntario' }

// ¡AQUÍ ESTÁ LA MAGIA! Hemos sacado el componente Field fuera de la función principal Perfil
const Field = ({ label, icon, value, onChange, readOnly = false, mono = false, type = "text", placeholder = "" }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">{icon}</span>
      <input
        type={type} 
        value={value}
        placeholder={placeholder}
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

export default function Perfil() {
  const { perfil: perfilCtx, rol } = useAuth()
  
  // Estado para los datos personales
  const [form, setForm] = useState({ nombre: '', dni: '', telefono: '' })
  const [loadingDatos, setLoadingDatos] = useState(false)

  // Estado para el cambio de contraseña
  const [passwords, setPasswords] = useState({ nueva: '', confirmar: '' })
  const [loadingPass, setLoadingPass] = useState(false)

  useEffect(() => {
    if (perfilCtx) {
      setForm({ nombre: perfilCtx.nombre ?? '', dni: perfilCtx.dni ?? '', telefono: perfilCtx.telefono ?? '' })
    }
  }, [perfilCtx])

  const fechaAlta = perfilCtx?.created_at
    ? new Date(perfilCtx.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  // Función para guardar los datos personales en la tabla 'perfiles'
  async function guardarDatos() {
    setLoadingDatos(true)
    const { error } = await supabase.from('perfiles').update(form).eq('id', perfilCtx.id)
    setLoadingDatos(false)
    if (!error) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
        .fire({ icon: 'success', title: '¡Datos actualizados!' })
    } else {
      Swal.fire('Error', error.message, 'error')
    }
  }

  // Función para cambiar la contraseña en la autenticación de Supabase
  async function guardarPassword() {
    if (!passwords.nueva || !passwords.confirmar) {
      Swal.fire({ icon: 'warning', title: 'Campos vacíos', text: 'Por favor, rellena ambas contraseñas.' })
      return
    }
    if (passwords.nueva !== passwords.confirmar) {
      Swal.fire({ icon: 'error', title: 'No coinciden', text: 'Las contraseñas escritas no son iguales.' })
      return
    }
    if (passwords.nueva.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Contraseña corta', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    setLoadingPass(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.nueva })
    setLoadingPass(false)

    if (!error) {
      setPasswords({ nueva: '', confirmar: '' })
      Swal.fire({ icon: 'success', title: '¡Contraseña cambiada!', text: 'Tu nueva contraseña ya está activa.', confirmButtonColor: '#003366' })
    } else {
      Swal.fire('Error al cambiar contraseña', error.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <NavBarIntranet />
      <main className="container mx-auto px-4 py-6 max-w-xl space-y-6">
        
        {/* BLOQUE 1: DATOS PERSONALES */}
        <div className="bg-white rounded-2xl shadow-pc overflow-hidden border border-gray-100">
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
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
              <span className="text-lg shrink-0">ℹ️</span>
              <p>Por favor, mantén tus datos de contacto actualizados para que Jefatura pueda localizarte rápidamente en caso de operativo.</p>
            </div>

            <Field label="Nombre completo" icon="📝"
              value={form.nombre}
              onChange={v => setForm(f => ({ ...f, nombre: v }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="DNI / TIP" icon="🪪" mono
                value={form.dni}
                onChange={v => setForm(f => ({ ...f, dni: v }))}
              />
              <Field label="Teléfono" icon="📞" mono
                value={form.telefono}
                onChange={v => setForm(f => ({ ...f, telefono: v }))}
              />
            </div>

            <Field label="Fecha de alta" icon="📅" value={fechaAlta} readOnly />

            <Button onClick={guardarDatos} loading={loadingDatos} variant="secondary" size="lg" className="w-full">
              💾 Guardar Mis Datos
            </Button>
          </div>
        </div>

        {/* BLOQUE 2: SEGURIDAD (CONTRASEÑA) */}
        <div className="bg-white rounded-2xl shadow-pc overflow-hidden border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <span className="text-xl">🔐</span>
            <h2 className="text-lg font-bold text-gray-800">Seguridad</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Field 
              label="Nueva Contraseña" 
              icon="🔑" 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              value={passwords.nueva}
              onChange={v => setPasswords(p => ({ ...p, nueva: v }))}
            />
            <Field 
              label="Repetir Nueva Contraseña" 
              icon="🔑" 
              type="password" 
              placeholder="Escríbela de nuevo"
              value={passwords.confirmar}
              onChange={v => setPasswords(p => ({ ...p, confirmar: v }))}
            />
          </div>

          <Button onClick={guardarPassword} loading={loadingPass} variant="danger" size="lg" className="w-full bg-pc-orange hover:bg-orange-600 border-none">
            Actualizar Contraseña
          </Button>
        </div>

      </main>
    </div>
  )
}