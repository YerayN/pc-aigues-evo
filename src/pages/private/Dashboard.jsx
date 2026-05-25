import { Link } from 'react-router-dom'
import NavBarIntranet from '../../components/layout/NavBarIntranet'
import { useAuth } from '../../context/AuthContext'
import { useFichaje } from '../../hooks/useSupabase'
import Swal from 'sweetalert2'
import { ACTIVIDADES } from '../../constants/actividades'

// ─── Icono SVG inline ─────────────────────────────────────────
function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const P = {
  calendario: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  parte:      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  documentos: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2l4 4M14 2v4h4M16 13H8M16 17H8M10 9H8',
  inventario: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9-3h2a2 2 0 012 2v1H7V6a2 2 0 012-2z',
  horas:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l4 2',
  perfil:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z',
  gestion:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M12 12h.01M12 16h.01',
  mapa:       'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z',
  archivo:    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  stats:      'M18 20V10M12 20V4M6 20v-6',
}

// ─── Tarjeta módulo estándar ───────────────────────────────────
function ModCard({ to, icon, label, desc, accent }) {
  return (
    <Link to={to}
      className="group bg-white rounded-2xl shadow-pc border border-gray-100 p-4 flex items-center gap-3
                 hover:shadow-pc-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${accent}`}>
        <Icon d={P[icon]} size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-800 text-sm leading-tight">{label}</p>
        <p className="text-xs text-gray-400 leading-snug mt-0.5 truncate">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// ─── Tarjeta de acción primaria (grande) ──────────────────────
function ActionCard({ to, icon, label, desc, colorBg, colorIcon, colorText }) {
  return (
    <Link to={to}
      className={`group ${colorBg} rounded-2xl p-5 flex flex-col justify-between min-h-[120px]
                  hover:brightness-95 transition-all duration-200 active:scale-95 shadow-sm border border-white/20`}
    >
      <div className={`w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ${colorIcon}`}>
        <Icon d={P[icon]} size={20} />
      </div>
      <div>
        <p className={`font-bold text-base leading-tight ${colorText}`}>{label}</p>
        <p className={`text-xs mt-0.5 opacity-75 ${colorText}`}>{desc}</p>
      </div>
    </Link>
  )
}

// ─── Separador de sección ─────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 mt-5 first:mt-0">
      {children}
    </p>
  )
}

export default function Dashboard() {
  const { perfil, esJefe } = useAuth()
  const { sesionActiva, actividadActual, loading: loadingFichaje, entrar, salir } = useFichaje(perfil?.nombre)
  const primerNombre = perfil?.nombre?.split(' ')[0] ?? 'Compañero'

  async function gestionarFichaje() {
    if (sesionActiva) {
      const { isConfirmed } = await Swal.fire({
        title: '¿Terminar el turno?',
        text: 'Se registrará tu hora de salida.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#003366',
        confirmButtonText: 'Sí, terminar',
        cancelButtonText: 'Seguir',
      })
      if (!isConfirmed) return
      const { error } = await salir()
      if (!error) Swal.fire({ icon: 'success', title: '¡Turno finalizado!', text: 'Gracias por tu servicio.', timer: 2000, showConfirmButton: false })
    } else {
      const { value: actividad } = await Swal.fire({
        title: '⏱️ Entrar de Guardia',
        input: 'select',
        inputOptions: Object.fromEntries(ACTIVIDADES.map(a => [a.value, a.label])),
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        confirmButtonText: 'Confirmar entrada',
        cancelButtonText: 'Cancelar',
      })
      if (!actividad) return
      await entrar(actividad)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBarIntranet />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-pc-blue">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-start justify-between gap-4">

            {/* Saludo */}
            <div>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                Intranet · PC Aigües
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Hola, <span className="text-pc-orange">{primerNombre}</span> 👋
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {esJefe ? 'Coordinador Jefe' : 'Voluntario'}
              </p>
            </div>

            {/* Botón fichaje compacto en header */}
            <button
              onClick={gestionarFichaje}
              disabled={loadingFichaje}
              className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl
                border-2 border-white/20 shadow-lg transition-all active:scale-95 disabled:opacity-50
                ${sesionActiva ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              <span className="text-white text-xl">{sesionActiva ? '⏹' : '▶'}</span>
              <span className="text-white text-[9px] font-bold uppercase mt-0.5">
                {sesionActiva ? 'Salir' : 'Fichar'}
              </span>
            </button>
          </div>

          {/* Banner estado fichaje (solo cuando está dentro) */}
          {sesionActiva && (
            <div className="mt-3 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
              <p className="text-white text-sm font-medium">
                En servicio · <span className="font-bold">{actividadActual}</span>
              </p>
              <button
                onClick={gestionarFichaje}
                className="ml-auto text-red-300 hover:text-white text-xs font-bold transition underline"
              >
                Terminar
              </button>
            </div>
          )}
        </div>

        {/* Curva de separación */}
        <div className="h-5 bg-gray-50 rounded-t-[2rem]" />
      </div>

      {/* ── Contenido ──────────────────────────────────────── */}
      <main className="container mx-auto px-4 pb-12 -mt-2 max-w-2xl">

        {/* Acciones primarias — siempre las primeras en móvil */}
        <SectionLabel>Acciones rápidas</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mb-1">
          <ActionCard
            to="/partes"
            icon="parte"
            label="Nuevo Parte"
            desc="Registrar incidencia"
            colorBg="bg-rose-500"
            colorIcon="text-white"
            colorText="text-white"
          />
          <ActionCard
            to="/calendario"
            icon="calendario"
            label="Calendario"
            desc="Servicios y eventos"
            colorBg="bg-pc-blue"
            colorIcon="text-white"
            colorText="text-white"
          />
        </div>

        {/* Módulos de gestión personal */}
        <SectionLabel>Mi actividad</SectionLabel>
        <div className="space-y-2">
          <ModCard
            to="/fichaje"
            icon="horas"
            label="Mis Horas"
            desc="Historial de servicios y turnos"
            accent="bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
          />
          <ModCard
            to="/inventario"
            icon="inventario"
            label="Inventario"
            desc="Material prestado y almacén"
            accent="bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white"
          />
          <ModCard
            to="/perfil"
            icon="perfil"
            label="Mi Ficha"
            desc="Datos personales y rango"
            accent="bg-gray-100 text-gray-600 group-hover:bg-gray-700 group-hover:text-white"
          />
        </div>

        {/* Recursos */}
        <SectionLabel>Recursos</SectionLabel>
        <div className="space-y-2">
          <ModCard
            to="/documentos"
            icon="documentos"
            label="Documentos"
            desc="Protocolos, guías y normativa"
            accent="bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
          />
        </div>

        {/* Jefatura — solo visible para jefe/admin */}
        {esJefe && (
          <>
            <SectionLabel>Jefatura</SectionLabel>
            <div className="space-y-2">
              <ModCard
                to="/gestion"
                icon="gestion"
                label="Gestión jefatura"
                desc="Servicios, alertas y estadísticas"
                accent="bg-orange-50 text-orange-600 group-hover:bg-pc-orange group-hover:text-white"
              />
              <ModCard
                to="/admin/mapa"
                icon="mapa"
                label="Editor de Mapa"
                desc="Dibujar cortes, zonas y avisos"
                accent="bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white"
              />
              <ModCard
                to="/admin/partes"
                icon="archivo"
                label="Libro de Partes"
                desc="Archivo de expedientes e informes"
                accent="bg-gray-100 text-gray-600 group-hover:bg-gray-700 group-hover:text-white"
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
