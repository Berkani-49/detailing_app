import { useState } from 'react'
import { StatusBar, FONT } from '../components/Shared'

export default function RoleScreen({ onSelect }) {
  const [pressed, setPressed] = useState(null)

  const roles = [
    {
      id: 'client',
      title: 'Je suis client',
      subtitle: 'Trouvez un nettoyeur près de chez vous, réservez en ligne et suivez votre véhicule.',
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      accent: '#1D4ED8',
      glow: 'rgba(29,78,216,0.4)',
    },
    {
      id: 'pro',
      title: 'Je suis nettoyeur',
      subtitle: 'Gérez vos rendez-vous, votre planning et vos revenus depuis une seule interface.',
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      accent: '#3730A3',
      glow: 'rgba(55,48,163,0.35)',
    },
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#08080E',
      backgroundImage:
        'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(29,78,216,0.22) 0%, transparent 65%),' +
        'radial-gradient(ellipse 50% 30% at 88% 108%, rgba(124,58,237,0.12) 0%, transparent 55%)',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 22px 52px',
      overflowY: 'auto',
    }}>
      <StatusBar light />

      {/* Logo block */}
      <div style={{ marginTop: 48, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 86, height: 86, borderRadius: 28,
          background: 'linear-gradient(145deg,#101020,#1C1C30)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px rgba(29,78,216,0.2), 0 24px 64px rgba(0,0,0,0.7)',
          marginBottom: 24,
        }}>
          <svg viewBox="0 0 48 48" width="52" height="52" fill="none">
            <path d="M4 31L10 31L10 26Q14 17 24 13L37 13Q47 13 47 25L47 31L49 31" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="15" cy="34" r="5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2"/>
            <circle cx="36" cy="34" r="5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2"/>
            <circle cx="29" cy="7" r="3.5" fill="#1D4ED8"/>
            <line x1="29" y1="3" x2="29" y2="0.5" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="32.5" y1="4.5" x2="34.5" y2="2.5" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="25.5" y1="4.5" x2="23.5" y2="2.5" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>
          DetailPro
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, margin: '10px 0 0', textAlign: 'center', lineHeight: 1.5, letterSpacing: 0.1 }}>
          L'excellence automobile<br />à portée de main
        </p>

        {/* Country flags row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: R.full, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['🇧🇪','🇫🇷','🇳🇱','🇱🇺','🇩🇪'].map((f, i) => (
            <span key={i} style={{ fontSize: 16, opacity: 0.75 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Role cards */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 44 }}>
        {roles.map(r => (
          <button
            key={r.id}
            onMouseDown={() => setPressed(r.id)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(r.id)}
            onTouchEnd={() => { setPressed(null); onSelect(r.id) }}
            onClick={() => onSelect(r.id)}
            style={{
              width: '100%',
              border: '1px solid rgba(255,255,255,0.09)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: FONT,
              background: pressed === r.id ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 22,
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              transition: 'transform 0.1s, background 0.1s',
              transform: pressed === r.id ? 'scale(0.975)' : 'scale(1)',
              boxShadow: r.id === 'client'
                ? `0 0 0 1px rgba(29,78,216,0.25), 0 12px 40px rgba(0,0,0,0.45)`
                : '0 12px 36px rgba(0,0,0,0.35)',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 17, flexShrink: 0,
              background: `linear-gradient(145deg,${r.accent}CC,${r.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 20px ${r.glow}`,
            }}>
              {r.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 700, marginBottom: 4, letterSpacing: -0.2 }}>
                {r.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.5 }}>
                {r.subtitle}
              </div>
            </div>

            {/* Arrow */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 40, textAlign: 'center', lineHeight: 1.7, letterSpacing: 0.1 }}>
        En continuant, vous acceptez les{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer', opacity: 1.4 }}>conditions d'utilisation</span>
        {' '}et la{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>politique de confidentialité</span>
      </p>
    </div>
  )
}

// Local constant needed for the flag container border radius
const R = { full: 999 }
