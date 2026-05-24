import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button, Input, Textarea, Select } from '../../components/ui'
import Swal from 'sweetalert2'

const TIPOS = [
  { value: 'Sanitario',    label: '🚑 Sanitario' },
  { value: 'Trafico',      label: '🚗 Accidente Tráfico' },
  { value: 'Incendio',     label: '🔥 Incendio / Conato' },
  { value: 'Rescate',      label: '⛑️ Rescate / Búsqueda' },
  { value: 'Meteorologia', label: '🌧️ Incidencia Climática' },
  { value: 'Animales',     label: '🐕 Animales' },
  { value: 'Preventivo',   label: '🚧 Preventivo / Evento' },
  { value: 'Otro',         label: '📝 Otro' },
]

export default function Partes() {
  const { perfil } = useAuth()
  const navigate   = useNavigate()

  const ahora = new Date()
  const fechaLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const [form, setForm] = useState({
    tipo:         'Sanitario',
    fecha:        fechaLocal,
    ubicacion:    '',
    descripcion:  '',
    victimas:     '',
    acciones:     '',
    recursos:     '',
    organismos:   '',
  })
  const [errores,   setErrores]   = useState({})
  const [enviando,  setEnviando]  = useState(false)

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (errores[campo]) setErrores(e => ({ ...e, [campo]: null }))
  }

  function validar() {
    const nuevos = {}
    if (!form.ubicacion.trim())   nuevos.ubicacion   = 'La ubicación es obligatoria'
    if (!form.descripcion.trim()) nuevos.descripcion = 'La descripción es obligatoria'
    if (!form.acciones.trim())    nuevos.acciones    = 'Las acciones realizadas son obligatorias'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return

    setEnviando(true)
    const { error } = await supabase.from('partes_incidencia').insert([{
      usuario_creador:    perfil?.nombre ?? 'Anónimo',
      fecha_hora:         new Date(form.fecha).toISOString(),
      tipo:               form.tipo,
      ubicacion:          form.ubicacion.trim(),
      descripcion:        form.descripcion.trim(),
      victimas_info:      form.victimas.trim(),
      acciones_realizadas: form.acciones.trim(),
      recursos_usados:    form.recursos.trim(),
      organismos_presentes: form.organismos.trim(),
    }])

    setEnviando(false)

    if (error) {
      Swal.fire({ icon: 'error', title: 'Error al enviar', text: error.message, confirmButtonColor: '#d33' })
      return
    }

    Swal.fire({
      icon: 'success',
      title: '¡Informe Registrado!',
      text: 'El parte se ha guardado correctamente en el archivo.',
      confirmButtonText: 'Volver al Menú',
      confirmButtonColor: '#003366',
      allowOutsideClick: false,
    }).then(() => navigate('/dashboard'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📝 Nuevo Parte de Servicio</h1>
          <p className="text-sm text-gray-500 mt-1">Rellena con precisión. Este documento es oficial.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Bloque: meta */}
          <div className="bg-white p-4 rounded-2xl shadow-pc border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Voluntario informante</label>
              <p className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                {perfil?.nombre ?? '—'}
              </p>
            </div>
            <Input
              label="Fecha y hora"
              type="datetime-local"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
            />
          </div>

          {/* Bloque: incidente */}
          <div className="bg-white p-4 rounded-2xl shadow-pc border-l-4 border-l-pc-orange border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">🔥 El Incidente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Tipo de suceso" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
              <Input
                label="Ubicación exacta *"
                placeholder="C/ Mayor 4, Km 12 CV-xxx..."
                value={form.ubicacion}
                onChange={e => set('ubicacion', e.target.value)}
                error={errores.ubicacion}
              />
            </div>
            <Textarea
              label="Descripción breve *"
              placeholder="Ej: Caída de persona mayor en vía pública con brecha en cabeza..."
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              error={errores.descripcion}
              rows={3}
            />
          </div>

          {/* Bloque: afectados */}
          <div className="bg-white p-4 rounded-2xl shadow-pc border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">🤕 Datos de Afectados</h3>
            <Textarea
              placeholder="Nombres, Edad, DNI (si procede), Vehículos implicados... (dejar en blanco si no hay heridos)"
              value={form.victimas}
              onChange={e => set('victimas', e.target.value)}
              rows={2}
            />
          </div>

          {/* Bloque: actuación */}
          <div className="bg-white p-4 rounded-2xl shadow-pc border-l-4 border-l-pc-blue border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">🛠️ Nuestra Actuación</h3>
            <Textarea
              label="¿Qué habéis hecho? *"
              placeholder="Ej: Se realiza primera valoración, control de hemorragia, balizamiento de zona y aviso a CICU."
              value={form.acciones}
              onChange={e => set('acciones', e.target.value)}
              error={errores.acciones}
              rows={4}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recursos usados"
                placeholder="Ambulancia, DESA, 2 Extintores..."
                value={form.recursos}
                onChange={e => set('recursos', e.target.value)}
              />
              <Input
                label="Otros organismos"
                placeholder="Policía, Bomberos, GC..."
                value={form.organismos}
                onChange={e => set('organismos', e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" variant="secondary" size="lg" loading={enviando} className="w-full">
            📩 Firmar y Enviar Parte
          </Button>
        </form>
      </main>
    </div>
  )
}
