/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Protección Civil
        pc: {
          orange: '#FF6600',
          'orange-dark': '#CC5200',
          'orange-light': '#FF8533',
          blue: '#003366',
          'blue-dark': '#002244',
          'blue-light': '#0055AA',
          'blue-muted': '#1a4a7a',
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
