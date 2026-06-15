import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SobreNosotros() {
  const [voluntarios, setVoluntarios] = useState([])

  useEffect(() => {
    async function cargarEquipo() {
      // Pedimos a Supabase la lista de todos los perfiles registrados
      const { data } = await supabase.from('perfiles').select('*').order('nombre')
      if (data) setVoluntarios(data)
    }
    cargarEquipo()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ── Cabecera pública sencilla ── */}
      <nav className="bg-pc-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full p-0.5 shadow-sm">
              <img src="/escudo.png" alt="Escudo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-base md:text-lg tracking-wide leading-tight">
              Protección Civil <br className="md:hidden" /> Aigües
            </span>
          </div>
          <Link to="/" className="text-xs md:text-sm bg-white/10 hover:bg-white/20 px-3 py-2 md:px-4 rounded-lg transition font-medium border border-white/10">
            Volver a inicio
          </Link>
        </div>
      </nav>

      {/* ── Título y descripción de la Agrupación ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 tracking-tight">
            Nuestro Equipo Humano
          </h1>
          <p className="text-gray-500 md:text-lg leading-relaxed max-w-2xl mx-auto">
            Somos un grupo de vecinos voluntarios comprometidos con la seguridad, la prevención y el bienestar de nuestro pueblo. 
            Conoce a las personas que están al pie del cañón, siempre dispuestas a ayudar.
          </p>
        </div>
      </div>

      {/* ── Rejilla de fotos tipo DNI ── */}
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          
          {voluntarios.map((vol, index) => {
            // Si el voluntario aún no tiene foto, le ponemos un muñequito por defecto
            const fotoPerfil = vol.foto_url 
              ? vol.foto_url 
              : 'https://cdn-icons-png.flaticon.com/512/847/847969.png' // Avatar genérico
            
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                
                {/* Contenedor de la foto tipo carnet (Proporción 3:4) */}
                <div className="aspect-[3/4] w-full bg-blue-50/50 overflow-hidden relative">
                  <img 
                    src={fotoPerfil} 
                    alt={`Foto de ${vol.nombre}`} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Datos del voluntario */}
                <div className="p-4 text-center border-t-[3px] border-pc-orange">
                  <p className="font-bold text-gray-800 text-sm leading-tight">
                    {vol.nombre}
                  </p>
                  <p className="text-[10px] text-pc-blue font-bold uppercase tracking-widest mt-1.5 opacity-80">
                    {vol.rol === 'jefe' ? 'Coordinador' : 'Voluntario'}
                  </p>
                </div>

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}