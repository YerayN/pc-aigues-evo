# PC Aigües — Intranet y Web Pública

Aplicación web para la Agrupación de Voluntarios de Protección Civil de Aigües.

## Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (Auth, DB, Realtime)
- React Router v6
- Recharts
- Leaflet / React Leaflet

## Instalación

```bash
npm install
cp .env.example .env
# Rellenar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env
npm run dev
```

## Estructura

```
src/
├── lib/          # Cliente Supabase
├── context/      # AuthContext
├── hooks/        # useQuery, useFichaje, useAlertaPublica
├── components/   # NavBar, ProtectedRoute, MapaPublico, UI
└── pages/
    ├── public/   # Home, Login, Reportar
    ├── private/  # Dashboard, Calendario, Partes, Inventario...
    └── admin/    # Gestion, AdminMapa, AdminPartes
```

## Despliegue

El proyecto está configurado para Vercel. Variables de entorno necesarias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
