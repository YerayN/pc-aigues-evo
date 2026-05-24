
// ── SPINNER ──────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'orange' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = {
    orange: 'border-pc-orange',
    blue:   'border-pc-blue',
    white:  'border-white',
  }
  return (
    <div className={`${sizes[size]} border-4 border-gray-200 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm mt-4">Cargando...</p>
      </div>
    </div>
  )
}

// ── BADGE ─────────────────────────────────────────────────
const BADGE_VARIANTS = {
  green:  'bg-green-100 text-green-700 border-green-200',
  red:    'bg-red-100 text-red-600 border-red-200',
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${BADGE_VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ── BUTTON ────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary:   'bg-pc-orange hover:bg-pc-orange-dark text-white shadow-orange hover:shadow-none',
  secondary: 'bg-pc-blue hover:bg-pc-blue-dark text-white shadow-pc hover:shadow-none',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-200',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  success:   'bg-green-500 hover:bg-green-600 text-white',
}

export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold rounded-xl
        transition-all duration-200 active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        ${BTN_VARIANTS[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  )
}

// ── CARD ──────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-pc border border-gray-100 p-6
        ${hover ? 'hover:shadow-pc-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ── INPUT ─────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 border rounded-xl bg-white
          focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none
          transition text-sm text-gray-800
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── SELECT ────────────────────────────────────────────────
export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white
          focus:ring-2 focus:ring-pc-orange outline-none transition text-sm
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ── TEXTAREA ──────────────────────────────────────────────
export function Textarea({ label, error, rows = 3, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2.5 border rounded-xl bg-white
          focus:ring-2 focus:ring-pc-orange focus:border-transparent outline-none
          transition text-sm resize-none
          ${error ? 'border-red-400' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
