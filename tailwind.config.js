/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Protección Civil
        pc: {
          orange: '#fe481f',          // Tu nuevo naranja base (más vivo y de emergencia)
          'orange-dark': '#c9310e',   // Un tono más tostado para los efectos :hover de los botones
          'orange-light': '#ff6e4a',  // Un naranja más suave para alertas o detalles pequeños
          blue: '#1f2b5f',            // Tu nuevo azul base (marino profundo corporativo)
          'blue-dark': '#11193c',     // Azul noche muy oscuro para textos principales o fondos de tarjetas
          'blue-light': '#364993',    // Un azul más claro y eléctrico para destacar cosas sueltas
          'blue-muted': '#3c4b7d',
        }
      },
      fontFamily: {
        // DM Sans: moderna, legible, profesional sin ser genérica
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      boxShadow: {
        'pc': '0 4px 24px rgba(0, 51, 102, 0.12)',
        'pc-lg': '0 8px 40px rgba(0, 51, 102, 0.18)',
        'orange': '0 4px 20px rgba(255, 102, 0, 0.3)',
      }
    }
  },
  plugins: []
}
