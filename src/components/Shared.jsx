// ─── DESIGN SYSTEM — DetailPro Premium ────────────────────────────────────────
export const C = {
  bg:         '#EAEAF0',         // Neutral canvas — subtle cool tint
  card:       '#FFFFFF',
  dark:       '#0C0C10',         // Near-black, never pure #000
  primary:    '#18181B',         // Zinc-900
  secondary:  '#52525B',         // Zinc-600
  tertiary:   '#A1A1AA',         // Zinc-400
  quaternary: '#D4D4D8',         // Zinc-300
  separator:  'rgba(24,24,27,0.07)',
  fill:       'rgba(24,24,27,0.05)',
  fill2:      'rgba(24,24,27,0.035)',
  // Single accent — cobalt blue (premium, automotive)
  blue:       '#1D4ED8',
  // System semantic colors
  green:      '#16A34A',
  orange:     '#EA580C',
  red:        '#DC2626',
  indigo:     '#7C3AED',
  yellow:     '#CA8A04',
}

export const SHADOW = {
  xs: '0 1px 3px rgba(0,0,0,0.04)',
  sm: '0 1px 4px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05)',
  md: '0 2px 8px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.07), 0 20px 48px rgba(0,0,0,0.11)',
}

export const R = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, full: 999 }
export const FONT = "'Outfit', -apple-system, 'Helvetica Neue', sans-serif"

export const SVC_GRAD = {
  'Lavage Extérieur Pro':          'linear-gradient(155deg,#0F2044 0%,#1A3D7A 100%)',
  'Lavage Extérieur Premium':      'linear-gradient(155deg,#0F2044 0%,#1A3D7A 100%)',
  'Uitwendige Reiniging Pro':      'linear-gradient(155deg,#0F2044 0%,#1A3D7A 100%)',
  'Detailing Intérieur':           'linear-gradient(155deg,#2D1408 0%,#6B3010 100%)',
  'Full Detailing':                'linear-gradient(155deg,#0D1117 0%,#1E2535 100%)',
  'Full Detailing Excellence':     'linear-gradient(155deg,#0D1117 0%,#1E2535 100%)',
  'Traitement Céramique 9H':       'linear-gradient(155deg,#060E20 0%,#0F2050 100%)',
  'Traitement Céramique Grand Duché':'linear-gradient(155deg,#060E20 0%,#0F2050 100%)',
  'Keramische Coating 9H':         'linear-gradient(155deg,#060E20 0%,#0F2050 100%)',
  'Correction de Peinture':        'linear-gradient(155deg,#1F0606 0%,#5C1010 100%)',
  'default':                       'linear-gradient(155deg,#0D1117 0%,#1E2535 100%)',
}

export function svcGrad(name) {
  return SVC_GRAD[name] || SVC_GRAD.default
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
export function CarSVG({ opacity = 0.18, w = '72%' }) {
  return (
    <svg viewBox="0 0 280 110" style={{ width: w, opacity }} fill="none">
      <ellipse cx="140" cy="100" rx="120" ry="8" fill="rgba(0,0,0,0.25)" />
      <path d="M20 72 L42 72 L42 60 Q47 40 74 29 L178 29 Q210 29 220 48 L236 72 L256 72 Q261 72 261 66 L261 62 Q246 58 241 51 L207 24 Q190 9 156 7 L106 7 Q72 7 55 24 L26 55 Q18 60 16 64 L16 68 Q16 72 20 72 Z" fill="white" />
      <path d="M80 50 L89 22 Q94 13 115 11 L158 11 Q181 11 188 22 L197 50 Z" fill="rgba(255,255,255,0.22)" />
      <circle cx="76"  cy="75" r="18" fill="rgba(0,0,0,0.25)" stroke="white" strokeWidth="2.5" />
      <circle cx="76"  cy="75" r="7"  fill="rgba(255,255,255,0.12)" />
      <circle cx="200" cy="75" r="18" fill="rgba(0,0,0,0.25)" stroke="white" strokeWidth="2.5" />
      <circle cx="200" cy="75" r="7"  fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}

export function Stars({ rating = 4.8, size = 12 }) {
  const full = Math.round(rating)
  return (
    <span style={{ color: C.yellow, fontSize: size, letterSpacing: 0.5 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="no-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
      {tabs.map(t => {
        const on = t === active
        return (
          <button key={t} onClick={() => onChange(t)} style={{
            flexShrink: 0,
            padding: '8px 18px',
            borderRadius: R.full,
            border: on ? 'none' : `1px solid ${C.separator}`,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: on ? 700 : 500,
            fontFamily: FONT,
            letterSpacing: on ? -0.1 : 0,
            transition: 'all 0.15s',
            background: on ? C.primary : C.card,
            color: on ? '#fff' : C.secondary,
            boxShadow: on ? SHADOW.sm : 'none',
          }}>{t}</button>
        )
      })}
    </div>
  )
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ color: C.primary, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>{title}</span>
      {action && (
        <span onClick={onAction} style={{ color: C.blue, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {action}
        </span>
      )}
    </div>
  )
}

export function StatusBar({ light = false }) {
  const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const col = light ? 'rgba(255,255,255,0.9)' : C.primary
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 0', fontSize: 14, fontWeight: 700, color: col, fontFamily: FONT }}>
      <span>{t}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {/* Signal bars */}
        <svg viewBox="0 0 16 10" width="16" height="10" fill={col}>
          <rect x="0" y="6" width="3" height="4" rx="0.8" opacity="0.4"/>
          <rect x="4.5" y="4" width="3" height="6" rx="0.8" opacity="0.65"/>
          <rect x="9" y="2" width="3" height="8" rx="0.8" opacity="0.85"/>
          <rect x="13.5" y="0" width="3" height="10" rx="0.8"/>
        </svg>
        {/* WiFi */}
        <svg viewBox="0 0 16 12" width="14" height="10" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4.5C4 1.5 12 1.5 15 4.5" opacity="0.35"/>
          <path d="M3.5 7C5.5 5 10.5 5 12.5 7" opacity="0.65"/>
          <path d="M6 9.5C7 8.5 9 8.5 10 9.5"/>
          <circle cx="8" cy="12" r="1" fill={col} stroke="none"/>
        </svg>
        {/* Battery */}
        <svg viewBox="0 0 24 12" width="22" height="10" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={col} strokeOpacity="0.45"/>
          <rect x="21" y="3.5" width="2.5" height="5" rx="1" fill={col} fillOpacity="0.4"/>
          <rect x="2" y="2" width="14" height="8" rx="1.5" fill={col}/>
        </svg>
      </div>
    </div>
  )
}

export function Spinner({ size = 32, color = C.blue }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{
        width: size, height: size, borderRadius: size,
        border: `2.5px solid ${C.fill}`,
        borderTop: `2.5px solid ${color}`,
        animation: 'spin 0.75s linear infinite',
      }} />
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 28px', fontFamily: FONT }}>
      <div style={{
        width: 64, height: 64, borderRadius: R.xxl,
        background: C.fill, display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 18px',
        fontSize: typeof icon === 'string' ? 28 : undefined,
      }}>{icon}</div>
      <h3 style={{ color: C.primary, fontSize: 18, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.3 }}>{title}</h3>
      <p style={{ color: C.secondary, fontSize: 14, margin: '0 0 24px', lineHeight: 1.55, maxWidth: 240, marginLeft: 'auto', marginRight: 'auto' }}>{subtitle}</p>
      {action && (
        <button onClick={onAction} style={{
          background: C.primary, border: 'none', borderRadius: R.lg,
          padding: '12px 26px', color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.sm,
        }}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Badge({ label, color = C.blue }) {
  return (
    <div style={{ display: 'inline-flex', background: `${color}14`, borderRadius: R.full, padding: '3px 10px', border: `1px solid ${color}20` }}>
      <span style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}>{label}</span>
    </div>
  )
}

// ─── CARD COMPONENTS ──────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card,
      borderRadius: R.xl,
      border: `1px solid ${C.separator}`,
      boxShadow: SHADOW.sm,
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function DataRow({ label, value, bold, last = false }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
        <span style={{ color: C.secondary, fontSize: 14 }}>{label}</span>
        <span style={{ color: C.primary, fontSize: 14, fontWeight: bold ? 700 : 500 }}>{value}</span>
      </div>
      {!last && <div style={{ height: 1, background: C.separator, marginLeft: 18 }} />}
    </>
  )
}

// Inject shared styles once
if (typeof document !== 'undefined' && !document.getElementById('shared-styles')) {
  const s = document.createElement('style')
  s.id = 'shared-styles'
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(s)
}
