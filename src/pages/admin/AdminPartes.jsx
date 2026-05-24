import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { supabase } from '../../lib/supabase'
import { LoadingPage, EmptyState, Badge } from '../../components/ui'
import Swal from 'sweetalert2'
import { useEffect } from 'react'

const TIPO_CONFIG = {
  Sanitario:    { icono: '🚑', bg: 'bg-red-100 text-red-600' },
  Incendio:     { icono: '🔥', bg: 'bg-orange-100 text-orange-600' },
  Trafico:      { icono: '🚗', bg: 'bg-blue-100 text-blue-600' },
  Animales:     { icono: '🐕', bg: 'bg-green-100 text-green-600' },
  Preventivo:   { icono: '🚧', bg: 'bg-purple-100 text-purple-600' },
  Rescate:      { icono: '⛑️', bg: 'bg-yellow-100 text-yellow-700' },
  Meteorologia: { icono: '🌧️', bg: 'bg-sky-100 text-sky-600' },
}

export default function AdminPartes() {
  const [partes,   setPartes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [abiertos, setAbiertos] = useState(new Set())

  // Estado de los inputs — solo cambia mientras el usuario escribe
  const [inputFecha, setInputFecha] = useState('')
  const [inputTipo,  setInputTipo]  = useState('')

  // Estado de búsqueda activa — solo cambia al pulsar la lupa
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroTipo,  setFiltroTipo]  = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('partes_incidencia').select('*').order('id', { ascending: false })
    if (filtroFecha) {
      const desde = new Date(filtroFecha); desde.setHours(0, 0, 0, 0)
      const hasta = new Date(filtroFecha); hasta.setHours(23, 59, 59)
      q = q.gte('fecha_hora', desde.toISOString()).lte('fecha_hora', hasta.toISOString())
    }
    if (filtroTipo) q = q.eq('tipo', filtroTipo)
    const { data } = await q
    setPartes(data ?? [])
    setLoading(false)
  }, [filtroFecha, filtroTipo])

  // Solo se dispara al montar y cuando cambian los filtros CONFIRMADOS
  useEffect(() => { cargar() }, [cargar])

  // Aplicar filtros al pulsar la lupa
  function buscar() {
    setFiltroFecha(inputFecha)
    setFiltroTipo(inputTipo)
  }

  // Permitir buscar también con Enter en los inputs
  function handleKeyDown(e) {
    if (e.key === 'Enter') buscar()
  }

  function toggle(id) {
    setAbiertos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function imprimirPorId() {
    const { value: id } = await Swal.fire({
      title: '🖨️ Imprimir Informe',
      input: 'number',
      inputLabel: 'Número de Expediente',
      inputPlaceholder: 'Ej: 7',
      showCancelButton: true,
      confirmButtonText: 'Buscar e Imprimir',
      confirmButtonColor: '#003366',
    })
    if (!id) return
    const { data, error } = await supabase.from('partes_incidencia').select('*').eq('id', id).single()
    if (error || !data) { Swal.fire({ icon: 'error', title: `No existe el expediente #${id}` }); return }
    abrirVentanaImpresion(data)
  }

  function abrirVentanaImpresion(p) {
    const fechaObj = new Date(p.fecha_hora)
    const dia  = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    const hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const ahora = new Date().toLocaleDateString('es-ES')

    // Buscamos la URL base para el logo (funciona en local y en Vercel)
    const logoUrl = `${window.location.origin}/escudo.png`

    const TIPO_COLOR = {
      Sanitario: '#dc2626', Incendio: '#ea580c', Trafico: '#2563eb',
      Rescate: '#d97706', Meteorologia: '#0891b2', Animales: '#16a34a',
      Preventivo: '#7c3aed', Otro: '#6b7280',
    }
    const colorTipo = TIPO_COLOR[p.tipo] ?? '#003366'

    const w = window.open('', '_blank', 'width=960,height=1100')
    w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Intervención #${p.id} — PC Aigües</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #111827;
      background: #fff;
      padding: 0;
      font-size: 13px;
      line-height: 1.5;
    }

    /* ── Cabecera corporativa ── */
    .header {
      background: #003366;
      color: white;
      padding: 28px 40px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .header-logo {
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 50%;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .header-logo img { width: 100%; height: 100%; object-fit: contain; }
    .header-text h1 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header-text p {
      font-size: 11px;
      opacity: 0.75;
      font-weight: 400;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header-expediente {
      margin-left: auto;
      text-align: right;
    }
    .header-expediente .num {
      font-size: 28px;
      font-weight: 700;
      color: #FF6600;
      line-height: 1;
    }
    .header-expediente .label-exp {
      font-size: 9px;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* ── Banda de tipo ── */
    .tipo-band {
      background: ${colorTipo};
      color: white;
      padding: 10px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tipo-band .tipo-label { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .tipo-band .fecha-label { font-size: 12px; opacity: 0.9; }

    /* ── Cuerpo ── */
    .body { padding: 32px 40px; }

    /* Alerta de afectados */
    .alerta-afectados {
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-left: 5px solid #dc2626;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .alerta-afectados .alerta-title {
      color: #dc2626;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .alerta-afectados p { color: #7f1d1d; font-size: 13px; }

    /* Secciones */
    .seccion { margin-bottom: 20px; }
    .seccion-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    .seccion-content {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #1f2937;
      white-space: pre-wrap;
      min-height: 36px;
    }
    .seccion-content.destacado {
      background: #eff6ff;
      border-color: #bfdbfe;
      font-style: italic;
      color: #1e3a5f;
    }
    .seccion-content.accion {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #14532d;
    }

    /* Grid de dos columnas */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

    /* Ubicación destacada */
    .ubicacion-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .ubicacion-icon { font-size: 20px; flex-shrink: 0; }
    .ubicacion-text { font-size: 14px; font-weight: 600; color: #9a3412; }

    /* Pie de firma */
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-informante .label-inf { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 4px; }
    .footer-informante .nombre { font-size: 15px; font-weight: 700; color: #003366; text-transform: uppercase; }
    .footer-informante .cargo { font-size: 10px; color: #6b7280; margin-top: 2px; }

    .firma-box {
      text-align: center;
      width: 240px;
    }
    .firma-line {
      border-top: 1.5px solid #374151;
      margin-bottom: 8px;
    }
    .firma-label { font-size: 10px; color: #6b7280; }
    .firma-sub { font-size: 9px; color: #9ca3af; margin-top: 2px; }

    /* Metadata bar */
    .meta-bar {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      gap: 32px;
      margin-bottom: 24px;
    }
    .meta-item .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 3px; }
    .meta-item .meta-val { font-size: 13px; font-weight: 600; color: #1f2937; }

    /* Watermark emisión */
    .emision { font-size: 9px; color: #d1d5db; text-align: right; margin-top: 16px; }

    @page { margin: 0; size: A4; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- CABECERA -->
  <div class="header">
    <div class="header-logo">
      <img src="${logoUrl}" alt="PC Aigües" onerror="this.style.display='none'">
    </div>
    <div class="header-text">
      <h1>Protección Civil Aigües</h1>
      <p>Informe Oficial de Intervención</p>
    </div>
    <div class="header-expediente">
      <div class="label-exp">Expediente</div>
      <div class="num">#${p.id}</div>
    </div>
  </div>

  <!-- BANDA DE TIPO -->
  <div class="tipo-band">
    <div class="tipo-label">${p.tipo}</div>
    <div class="fecha-label">📅 ${dia} &nbsp;·&nbsp; ⏰ ${hora}h</div>
  </div>

  <!-- CUERPO -->
  <div class="body">

    <!-- Metadata -->
    <div class="meta-bar">
      <div class="meta-item">
        <div class="meta-label">Tipo de incidente</div>
        <div class="meta-val">${p.tipo}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Fecha y hora</div>
        <div class="meta-val">${dia} &bull; ${hora}h</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Informante</div>
        <div class="meta-val">${p.usuario_creador}</div>
      </div>
    </div>

    <!-- Ubicación -->
    <div class="ubicacion-row">
      <div class="ubicacion-icon">📍</div>
      <div class="ubicacion-text">${p.ubicacion}</div>
    </div>

    <!-- Afectados (solo si existen) -->
    ${p.victimas_info ? `
    <div class="alerta-afectados">
      <div class="alerta-title">⚠️ Datos de afectados / víctimas</div>
      <p>${p.victimas_info}</p>
    </div>` : ''}

    <!-- Descripción -->
    <div class="seccion">
      <div class="seccion-title">Descripción de los hechos</div>
      <div class="seccion-content destacado">"${p.descripcion}"</div>
    </div>

    <!-- Actuación -->
    <div class="seccion">
      <div class="seccion-title">Actuación realizada</div>
      <div class="seccion-content accion">${p.acciones_realizadas}</div>
    </div>

    <!-- Recursos y Organismos -->
    <div class="grid-2">
      <div class="seccion">
        <div class="seccion-title">Recursos utilizados</div>
        <div class="seccion-content">${p.recursos_usados || 'No especificado'}</div>
      </div>
      <div class="seccion">
        <div class="seccion-title">Colaboración organismos externos</div>
        <div class="seccion-content">${p.organismos_presentes || 'Sin colaboración externa'}</div>
      </div>
    </div>

    <!-- Pie -->
    <div class="footer">
      <div class="footer-informante">
        <div class="label-inf">Voluntario informante</div>
        <div class="nombre">${p.usuario_creador}</div>
        <div class="cargo">Agrupación de Voluntarios de Protección Civil · Aigües</div>
      </div>
      <div class="firma-box">
        <div class="firma-line"></div>
        <div class="firma-label">Firma y Sello — Coordinador Jefe</div>
        <div class="firma-sub">Protección Civil Aigües</div>
      </div>
    </div>

    <div class="emision">Documento generado el ${ahora} · Protección Civil Aigües</div>
  </div>

  <script>
    window.onload = function() {
      // Pequeño delay para que cargue el logo antes de imprimir
      setTimeout(() => window.print(), 600);
    };
  </script>
</body>
</html>`)
    w.document.close()
  }

  if (loading) return <><NavBarIntranet /><LoadingPage /></>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarIntranet />
      <main className="container mx-auto px-4 py-6 max-w-5xl">

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-5 bg-white p-4 rounded-2xl shadow-pc border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">📁 Archivo de Partes</h1>
            <p className="text-sm text-gray-500">Consulta y generación de informes</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={inputFecha}
              onChange={e => setInputFecha(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pc-blue outline-none"
            />
            <select
              value={inputTipo}
              onChange={e => setInputTipo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-pc-blue outline-none"
            >
              <option value="">Todos los tipos</option>
              {Object.keys(TIPO_CONFIG).map(t => <option key={t} value={t}>{TIPO_CONFIG[t].icono} {t}</option>)}
            </select>
            <button
              onClick={buscar}
              className="bg-blue-50 text-pc-blue hover:bg-blue-100 px-4 py-2 rounded-xl font-bold text-sm transition"
              title="Buscar"
            >
              🔍
            </button>
            <button onClick={imprimirPorId} className="bg-gray-800 text-white hover:bg-black px-4 py-2 rounded-xl font-bold text-sm transition flex items-center gap-1">
              🖨️ ID
            </button>
          </div>
        </div>

        {/* Lista */}
        {partes.length === 0 ? (
          <EmptyState icon="📂" title="Sin partes" description="No hay partes con esos filtros." />
        ) : (
          <div className="space-y-3">
            {partes.map(p => {
              const cfg      = TIPO_CONFIG[p.tipo] ?? { icono: '📝', bg: 'bg-gray-100 text-gray-600' }
              const fechaObj = new Date(p.fecha_hora)
              const dia      = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              const hora     = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              const abierto  = abiertos.has(p.id)

              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-pc border border-gray-100 overflow-hidden">
                  <button onClick={() => toggle(p.id)} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition text-left">
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center text-lg shrink-0`}>
                      {cfg.icono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm uppercase">
                        {p.tipo} <span className="text-gray-400 font-normal text-xs">#{p.id}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">{p.ubicacion}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-700 text-sm">{dia}</p>
                      <p className="text-xs text-gray-400">{hora}h</p>
                    </div>
                    <span className={`text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {abierto && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50/50 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción</p>
                          <p className="bg-white border border-gray-200 rounded-xl p-3 italic text-gray-700">{p.descripcion}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Actuación</p>
                          <p className="text-gray-700">{p.acciones_realizadas}</p>
                        </div>
                        {p.victimas_info && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Afectados</p>
                            <p className="text-red-700">{p.victimas_info}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Recursos</p>
                          <p>{p.recursos_usados || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Colaboración</p>
                          <p>{p.organismos_presentes || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2 flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-400">
                            Informante: <span className="font-bold text-gray-700 uppercase">{p.usuario_creador}</span>
                          </p>
                          <button onClick={() => abrirVentanaImpresion(p)}
                            className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black transition flex items-center gap-1">
                            🖨️ Imprimir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
