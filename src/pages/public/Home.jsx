import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBarPublica from '../../components/layout/NavBarPublica'
import MapaPublico from '../../components/map/MapaPublico'

function climaIcono(cod) {
  if (cod === 0)  return { emoji: '☀️', label: 'Despejado' }
  if (cod <= 3)   return { emoji: '⛅', label: 'Nublado' }
  if (cod <= 48)  return { emoji: '🌫️', label: 'Niebla' }
  if (cod <= 67)  return { emoji: '🌧️', label: 'Lluvia' }
  if (cod <= 82)  return { emoji: '🌦️', label: 'Chubascos' }
  return           { emoji: '⛈️', label: 'Tormenta' }
}

// ── Icono SVG ─────────────────────────────────────────────────
function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ── Tarjeta "Por qué unirte" ──────────────────────────────────
function PorQueCard({ emoji, titulo, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="font-bold text-gray-800 text-base mb-2">{titulo}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

export default function Home() {
  const [tiempo, setTiempo]   = useState(null)
  const [form, setForm]       = useState({ nombre: '', apellidos: '', tel: '', email: '', msg: '' })
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.495&longitude=-0.362&current_weather=true')
      .then(r => r.json())
      .then(d => setTiempo({
        temp: d.current_weather.temperature,
        viento: d.current_weather.windspeed,
        ...climaIcono(d.current_weather.weathercode),
      }))
      .catch(() => {})
  }, [])

  function handleForm(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBarPublica />

      {/* ════════════════════════════════════════════════════
          HERO — cálido, cercano, con foto y lema original
      ════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden bg-white">

        {/* Mancha de color suave detrás del contenido */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 z-0" />

        {/* Círculo decorativo grande — fondo */}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full bg-pc-orange/5 z-0" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-blue-50 z-0" />

        <div className="relative z-10 container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">

            {/* Texto */}
            <div>
              {/* Chip */}
              <div className="inline-flex items-center gap-2 bg-pc-orange/10 text-pc-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-pc-orange animate-pulse" />
                Voluntarios · Aigües · Alicante
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                Siempre alerta,{' '}
                <span className="text-pc-blue">siempre cerca,</span>{' '}
                <br className="hidden sm:block" />
                <span className="text-pc-orange">siempre Aigües.</span>
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                Somos tus vecinos. Estamos formados y preparados para estar
                a tu lado cuando más importa.
              </p>

              {/* Tiempo actual */}
              {tiempo && (
                <div className="inline-flex items-center gap-3 bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-2xl mb-8">
                  <span className="text-2xl">{tiempo.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-base leading-none">{tiempo.temp}°C en Aigües</p>
                    <p className="text-gray-400 text-xs mt-0.5">{tiempo.label} · Viento {tiempo.viento} km/h</p>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/reportar"
                  className="flex items-center justify-center gap-2.5 bg-pc-orange hover:bg-pc-orange-dark
                             text-white font-bold py-3.5 px-7 rounded-2xl shadow-orange
                             transition-all duration-200 active:scale-95 text-sm"
                >
                  <Icon d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" size={18} />
                  Reportar incidencia
                </Link>

                <a
                  href="https://wa.me/34600000000"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-600
                             text-white font-bold py-3.5 px-7 rounded-2xl
                             transition-all duration-200 active:scale-95 text-sm"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Recibir alertas
                </a>
              </div>
            </div>

            {/* Foto hero */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-4 bg-pc-orange/10 rounded-3xl -z-10 rotate-2" />
              <img
                src="/fondo_hero.jpg"
                alt="Voluntarios de Protección Civil Aigües"
                className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
              />
              {/* Badge flotante sobre la foto */}
              <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Disponibles</p>
                <p className="text-gray-800 font-black text-xl leading-none">24 h · 365 días</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          MAPA
      ════════════════════════════════════════════════════ */}
      <section id="mapa" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-pc-blue/10 text-pc-blue px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Actualizado en tiempo real
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Mapa de incidencias
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Cortes de vía, avisos y alertas activas en Aigües ahora mismo.
            </p>
          </div>

          <div
            className="h-[460px] md:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-gray-200"
            style={{ isolation: 'isolate' }}
          >
            <MapaPublico />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POR QUÉ UNIRSE
      ════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              ¿Por qué ser voluntario?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Proteger tu pueblo es la tarea más cercana y más necesaria que existe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PorQueCard
              emoji="🏘️"
              titulo="Tu pueblo te necesita"
              desc="En Aigües somos una comunidad pequeña. Cada voluntario cuenta y marca una diferencia real para sus vecinos."
            />
            <PorQueCard
              emoji="🎓"
              titulo="Formación continua"
              desc="Primeros auxilios, extinción de incendios, evacuaciones. Te formamos desde cero sin que tengas experiencia previa."
            />
            <PorQueCard
              emoji="⛑️"
              titulo="Equipo y material"
              desc="Dispondrás de todo el equipamiento necesario para actuar con seguridad en cualquier situación de emergencia."
            />
            <PorQueCard
              emoji="🛡️"
              titulo="Seguro de accidentes"
              desc="Todos nuestros voluntarios cuentan con seguro de accidentes durante el ejercicio de sus funciones."
            />
            <PorQueCard
              emoji="🤝"
              titulo="Compañerismo real"
              desc="Formarás parte de un equipo unido. El compañerismo que se genera en Protección Civil va más allá del servicio."
            />
            <PorQueCard
              emoji="💙"
              titulo="Orgullo de pueblo"
              desc="Hay pocos privilegios más grandes que saber que cuando alguien en Aigües necesita ayuda, tú estarás ahí."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FORMULARIO DE INSCRIPCIÓN
      ════════════════════════════════════════════════════ */}
      <section id="voluntarios" className="py-16 md:py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-6 max-w-5xl">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">

              {/* Panel azul izquierdo */}
              <div className="md:col-span-2 bg-pc-blue p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">
                    Únete al equipo
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed mb-8">
                    Tu ayuda es fundamental. Fórmate y colabora activamente
                    en la seguridad de tu municipio.
                  </p>

                  <ul className="space-y-3">
                    {[
                      '🎓 Formación continua',
                      '⛑️ Equipo y material',
                      '🛡️ Seguro de accidentes',
                      '🤝 Gran equipo humano',
                    ].map(item => (
                      <li key={item}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl text-white text-sm font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-blue-300 text-xs mt-8 leading-relaxed">
                  ¿Tienes dudas? Escríbenos a{' '}
                  <a href="mailto:pcaigues@aigues.es" className="text-white underline hover:no-underline">
                    pcaigues@aigues.es
                  </a>
                </p>
              </div>

              {/* Formulario */}
              <div className="md:col-span-3 p-8 md:p-10">
                <h3 className="text-xl font-black text-gray-800 mb-6 pb-4 border-b border-gray-100">
                  Formulario de inscripción
                </h3>

                {enviado ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="text-gray-800 font-bold text-lg mb-2">¡Gracias por tu interés!</p>
                    <p className="text-gray-500 text-sm">
                      Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nombre</label>
                        <input type="text" required placeholder="Tu nombre"
                          value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Apellidos</label>
                        <input type="text" required placeholder="Tus apellidos"
                          value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Teléfono</label>
                      <input type="tel" required placeholder="600 000 000"
                        value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                      <input type="email" required placeholder="correo@ejemplo.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Mensaje <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                      </label>
                      <textarea rows={3} placeholder="¿Por qué quieres unirte? ¿Tienes alguna experiencia previa?"
                        value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <button type="submit"
                      className="w-full bg-pc-orange hover:bg-pc-orange-dark text-white font-bold
                                 py-4 rounded-xl shadow-orange transition-all active:scale-95 text-sm">
                      Enviar solicitud →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER — limpio, solo lo esencial
      ════════════════════════════════════════════════════ */}
      <footer className="bg-pc-blue text-white py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Derechos */}
            <p className="text-blue-200 text-xs text-center sm:text-left">
              © 2026 Protección Civil Aigües · Todos los derechos reservados.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Volver arriba */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-9 h-9 rounded-full bg-pc-orange hover:bg-pc-orange-dark flex items-center justify-center transition ml-2"
                title="Volver arriba"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
