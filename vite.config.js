import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'escudo.png'],
      manifest: {
        name: 'Protección Civil Aigües',
        short_name: 'PC Aigües',
        description: 'Intranet y web pública de Protección Civil Aigües',
        theme_color: '#003366',
        background_color: '#003366',
        display: 'standalone',
        icons: [
          { src: 'escudo.png', sizes: '192x192', type: 'image/png' },
          { src: 'escudo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // Cache páginas y assets para uso offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Cache de tiles del mapa (OpenStreetMap)
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ]
})