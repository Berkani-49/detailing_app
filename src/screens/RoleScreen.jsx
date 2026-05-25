import { useState } from 'react'
import { StatusBar, FONT } from '../components/Shared'

export default function RoleScreen({ onSelect }) {
  const [pressed, setPressed] = useState(null)

  const roles = [
    {
      id: 'client',
      title: 'Je suis client',
      subtitle: 'Trouvez un nettoyeur proche de chez vous, réservez en ligne et suivez votre véhicule en temps réel.',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      badge: 'Trouver un détailer',
    },
    {
      id: 'pro',
      title: 'Je suis nettoyeur',
      subtitle: 'Gérez vos rendez-vous, votre planning et votre activité depuis une seule interface.',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      badge: 'Gérer mon activité',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090F',
      backgroundImage:
        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,122,255,0.18) 0%, transparent 60%),' +
        'radial-gradient(ellipse 50% 35% at 85% 105%, rgba(88,86,214,0.1) 0%, transparent 50%)',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 24px 56px',
    }}>
      <StatusBar light />

      {/* Logo */}
      <div style={{ marginTop: 52, marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 82, height: 82, borderRadius: 26,
          background: 'linear-gradient(145deg,#141424,#1e1e38)',
          border: '1px solid rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px rgba(0,122,255,0.18), 0 20px 60px rgba(0,0,0,0.6)',
          marginBottom: 22,
        }}>
          <svg viewBox="0 0 48 48" width="54" height="54" fill="none">
            <path d="M7 31L13 31L13 26Q16 17 25 13L37 13Q46 13 46 24L46 31L48 31" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 31L10 31L10 26Q14 17 24 13L37 13Q47 13 47 25L47 31L49 31" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="15" cy="34" r="5" fill="none" stroke="white" strokeWidth="2.2"/>
            <circle cx="36" cy="34" r="5" fill="none" stroke="white" strokeWidth="2.2"/>
            <circle cx="29" cy="7" r="3.5" fill="#007AFF"/>
            <line x1="29" y1="3" x2="29" y2="0.5" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="32.5" y1="4.5" x2="34.5" y2="2.5" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="25.5" y1="4.5" x2="23.5" y2="2.5" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: 34, fontWeight: 800, letterSpacing: -1.2, margin: 0 }}>DetailPro</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, margin: '9px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
          L'excellence automobile<br />à portée de main
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          {['🇧🇪','🇫🇷','🇳🇱','🇱🇺','🇩🇪'].map((f, i) => (
            <span key={i} style={{ fontSize: 18, opacity: 0.7 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14, marginTop: 44 }}>
        {roles.map(r => (
          <button
            key={r.id}
            onMouseDown={() => setPressed(r.id)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(r.id)}
            onTouchEnd={() => { setPressed(null); onSelect(r.id) }}
            onClick={() => onSelect(r.id)}
            style={{
              width: '100%', border: '1px solid rgba(255,255,255,0.10)',
              cursor: 'pointer', textAlign: 'left', fontFamily: FONT,
              background: pressed === r.id ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(20px)',
              borderRadius: 22,
              padding: '22px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              transition: 'all 0.14s',
              transform: pressed === r.id ? 'scale(0.98)' : 'scale(1)',
              boxShadow: r.id === 'client'
                ? '0 0 0 1px rgba(0,122,255,0.2), 0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: r.id === 'client'
                ? 'linear-gradient(145deg,#0050cc,#007AFF)'
                : 'linear-gradient(145deg,#2a2a38,#3a3a50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: r.id === 'client' ? '0 4px 18px rgba(0,122,255,0.45)' : '0 4px 12px rgba(0,0,0,0.4)',
            }}>
              {r.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 700, marginBottom: 5, letterSpacing: -0.3 }}>
                {r.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.45 }}>
                {r.subtitle}
              </div>
            </div>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12, marginTop: 44, textAlign: 'center', lineHeight: 1.6 }}>
        En continuant, vous acceptez les{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>conditions d'utilisation</span>
        {' '}et la{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>politique de confidentialité</span>
      </p>
    </div>
  )
}
