// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
export const C = {
  bg:         '#F2F2F7',
  card:       '#FFFFFF',
  dark:       '#1C1C1E',
  primary:    '#1C1C1E',
  secondary:  '#636366',
  tertiary:   '#8E8E93',
  quaternary: '#C7C7CC',
  separator:  'rgba(60,60,67,0.12)',
  fill:       'rgba(120,120,128,0.12)',
  fill2:      'rgba(120,120,128,0.07)',
  blue:       '#007AFF',
  green:      '#34C759',
  orange:     '#FF9500',
  red:        '#FF3B30',
  yellow:     '#FFCC00',
  indigo:     '#5856D6',
}

export const SHADOW = {
  xs: '0 1px 2px rgba(0,0,0,0.04)',
  sm: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.07)',
  md: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.10)',
}

export const R = { xs:8, sm:12, md:16, lg:20, xl:24, xxl:32, full:999 }
export const FONT = "-apple-system,'SF Pro Display','Helvetica Neue',Arial,sans-serif"

export const SVC_GRAD = {
  'Lavage Extérieur Pro':    'linear-gradient(160deg,#1a3a6e 0%,#2d5fa8 100%)',
  'Lavage Extérieur Premium':'linear-gradient(160deg,#1a3a6e 0%,#2d5fa8 100%)',
  'Uitwendige Reiniging Pro':'linear-gradient(160deg,#1a3a6e 0%,#2d5fa8 100%)',
  'Detailing Intérieur':     'linear-gradient(160deg,#3d2008 0%,#7a4a1a 100%)',
  'Full Detailing':          'linear-gradient(160deg,#111418 0%,#2d3340 100%)',
  'Full Detailing Excellence':'linear-gradient(160deg,#111418 0%,#2d3340 100%)',
  'Traitement Céramique 9H': 'linear-gradient(160deg,#0a1628 0%,#1a3060 100%)',
  'Traitement Céramique Grand Duché':'linear-gradient(160deg,#0a1628 0%,#1a3060 100%)',
  'Keramische Coating 9H':   'linear-gradient(160deg,#0a1628 0%,#1a3060 100%)',
  'Correction de Peinture':  'linear-gradient(160deg,#2a0808 0%,#6b1a1a 100%)',
  'default':                 'linear-gradient(160deg,#111418 0%,#2d3340 100%)',
}

export function svcGrad(name) {
  return SVC_GRAD[name] || SVC_GRAD.default
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
export function CarSVG({ opacity = 0.18, w = '72%' }) {
  return (
    <svg viewBox="0 0 280 110" style={{ width: w, opacity }} fill="none">
      <ellipse cx="140" cy="100" rx="120" ry="8" fill="rgba(0,0,0,0.3)" />
      <path d="M20 72 L42 72 L42 60 Q47 40 74 29 L178 29 Q210 29 220 48 L236 72 L256 72 Q261 72 261 66 L261 62 Q246 58 241 51 L207 24 Q190 9 156 7 L106 7 Q72 7 55 24 L26 55 Q18 60 16 64 L16 68 Q16 72 20 72 Z" fill="white" />
      <path d="M80 50 L89 22 Q94 13 115 11 L158 11 Q181 11 188 22 L197 50 Z" fill="rgba(255,255,255,0.25)" />
      <circle cx="76"  cy="75" r="18" fill="rgba(0,0,0,0.3)" stroke="white" strokeWidth="2.5" />
      <circle cx="76"  cy="75" r="8"  fill="rgba(255,255,255,0.15)" />
      <circle cx="200" cy="75" r="18" fill="rgba(0,0,0,0.3)" stroke="white" strokeWidth="2.5" />
      <circle cx="200" cy="75" r="8"  fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

export function Stars({ rating = 4.8, size = 12 }) {
  const full = Math.round(rating)
  return (
    <span style={{ color: C.orange, fontSize: size, letterSpacing: 1 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="no-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
      {tabs.map(t => {
        const on = t === active
        return (
          <button key={t} onClick={() => onChange(t)} style={{
            flexShrink:0, padding:'8px 20px', borderRadius:R.full,
            border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
            fontFamily:FONT, transition:'all 0.18s',
            background: on ? C.dark : C.card,
            color: on ? '#fff' : C.primary,
            boxShadow: on ? 'none' : SHADOW.sm,
          }}>{t}</button>
        )
      })}
    </div>
  )
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
      <span style={{ color:C.primary, fontSize:20, fontWeight:700, letterSpacing:-0.3 }}>{title}</span>
      {action && (
        <span onClick={onAction} style={{ color:C.blue, fontSize:14, fontWeight:500, cursor:'pointer' }}>
          {action}
        </span>
      )}
    </div>
  )
}

export function StatusBar({ light = false }) {
  const t = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
  const col = light ? 'rgba(255,255,255,0.9)' : C.primary
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px 0', fontSize:15, fontWeight:700, color:col, fontFamily:FONT }}>
      <span>{t}</span>
      <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12 }}>
        <span>●●●●</span><span style={{ fontSize:10 }}>WiFi</span><span>▮▮</span>
      </div>
    </div>
  )
}

export function Spinner({ size = 32, color = C.blue }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
      <div style={{ width:size, height:size, borderRadius:size, border:`3px solid ${C.fill}`, borderTop:`3px solid ${color}`, animation:'spin 0.8s linear infinite' }}/>
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 30px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{icon}</div>
      <h3 style={{ color:C.primary, fontSize:20, fontWeight:700, margin:'0 0 8px', letterSpacing:-0.3 }}>{title}</h3>
      <p style={{ color:C.secondary, fontSize:15, margin:'0 0 24px', lineHeight:1.5 }}>{subtitle}</p>
      {action && (
        <button onClick={onAction} style={{ background:C.primary, border:'none', borderRadius:R.lg, padding:'13px 28px', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Badge({ label, color = C.blue }) {
  return (
    <div style={{ display:'inline-flex', background:`${color}18`, borderRadius:R.full, padding:'4px 12px' }}>
      <span style={{ color, fontSize:12, fontWeight:700 }}>{label}</span>
    </div>
  )
}

// Inline CSS for spinner (inject once)
if (typeof document !== 'undefined' && !document.getElementById('shared-styles')) {
  const s = document.createElement('style')
  s.id = 'shared-styles'
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(s)
}
