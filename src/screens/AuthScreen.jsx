import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, SHADOW, R, FONT, StatusBar } from '../components/Shared'

export default function AuthScreen({ role, onBack, urlError, onClearUrlError }) {
  const [mode,         setMode]         = useState('login')
  const [form,         setForm]         = useState({ email: '', password: '', name: '', phone: '' })
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(urlError === 'otp_expired' ? 'otp_expired' : null)
  const [emailSent,    setEmailSent]    = useState(false)
  const [resetMode,    setResetMode]    = useState(false)
  const [resetEmail,   setResetEmail]   = useState('')
  const [resetSent,    setResetSent]    = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resending,    setResending]    = useState(false)
  const [resendSent,   setResendSent]   = useState(false)

  const dbRole   = role === 'pro' ? 'detailer' : 'client'
  const isClient = role === 'client'
  const accent   = isClient ? C.blue : C.primary

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAuth = async () => {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name, role: dbRole, phone: form.phone } },
        })
        if (error) throw error
        if (data.user && !data.session) setEmailSent(true)
        else if (data.user && data.session && form.phone)
          await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
        if (prof && prof.role !== dbRole) {
          await supabase.auth.signOut()
          throw new Error(`WRONG_ROLE:${prof.role}`)
        }
      }
    } catch (e) {
      setError(translateError(e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!form.email) return
    setResending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email })
    setResending(false)
    if (error) setError(translateError(error.message))
    else { setResendSent(true); setError(null) }
  }

  const handleReset = async () => {
    if (!resetEmail) return
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: window.location.origin })
    setResetLoading(false)
    if (error) setError(translateError(error.message))
    else setResetSent(true)
  }

  // ── Mot de passe oublié ──────────────────────────────────────────────────────
  if (resetMode) return (
    <div style={{ minHeight: '100dvh', background: C.bg, fontFamily: FONT }}>
      <StatusBar />
      <div style={{ padding: '6px 16px 0' }}>
        <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(''); setError(null) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, display: 'flex', alignItems: 'center', gap: 6, color: C.blue, fontFamily: FONT, fontSize: 15, fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>
      </div>
      <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={{
            width: 54, height: 54, borderRadius: 18,
            background: `linear-gradient(145deg,#1338A8,${C.blue})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 22, boxShadow: `0 6px 20px ${C.blue}45`,
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ color: C.primary, fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.8 }}>Mot de passe oublié</h1>
          <p style={{ color: C.secondary, fontSize: 15, margin: 0, lineHeight: 1.5 }}>
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {resetSent ? (
          <div style={{ background: '#F0FDF4', borderRadius: R.xl, padding: '24px', border: `1px solid ${C.green}25`, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: R.full, background: `${C.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p style={{ color: C.green, fontSize: 16, fontWeight: 700, margin: 0 }}>Email envoyé !</p>
            <p style={{ color: C.secondary, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        ) : (
          <>
            <FieldCard>
              <Field label="Adresse e-mail" placeholder="email@exemple.com" value={resetEmail} onChange={setResetEmail} type="email" />
            </FieldCard>
            {error && <ErrorBox>{error}</ErrorBox>}
            <PrimaryBtn disabled={resetLoading || !resetEmail} onClick={handleReset} accent={C.blue}>
              {resetLoading ? 'Envoi en cours…' : 'Envoyer le lien'}
            </PrimaryBtn>
          </>
        )}

        {resetSent && (
          <PrimaryBtn onClick={() => { setResetMode(false); setResetSent(false); setResetEmail('') }} accent={C.primary}>
            Retour à la connexion
          </PrimaryBtn>
        )}
      </div>
    </div>
  )

  // ── Email de confirmation ────────────────────────────────────────────────────
  if (emailSent) return (
    <div style={{ minHeight: '100dvh', background: C.bg, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', gap: 22 }}>
      <div style={{
        width: 84, height: 84, borderRadius: R.full,
        background: isClient ? `linear-gradient(145deg,#1338A8,${C.blue})` : 'linear-gradient(145deg,#1C1C30,#2D2D48)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: SHADOW.lg,
      }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: C.primary, fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: -0.6 }}>Vérifiez votre email</h2>
        <p style={{ color: C.secondary, fontSize: 15, margin: '0 0 6px', lineHeight: 1.5 }}>Un lien de confirmation a été envoyé à</p>
        <p style={{ color: C.primary, fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>{form.email}</p>
        <p style={{ color: C.tertiary, fontSize: 14, margin: 0, lineHeight: 1.55 }}>
          Cliquez sur le lien dans l'email puis revenez ici pour vous connecter.
        </p>
      </div>
      <div style={{ width: '100%', background: C.card, borderRadius: R.xl, padding: '16px 20px', boxShadow: SHADOW.sm, border: `1px solid ${C.separator}` }}>
        <p style={{ color: C.blue, fontSize: 13, margin: '0 0 4px', fontWeight: 600 }}>Conseil</p>
        <p style={{ color: C.secondary, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Vérifiez aussi vos spams si vous ne trouvez pas l'email.
        </p>
      </div>
      <PrimaryBtn onClick={() => { setEmailSent(false); setMode('login') }} accent={C.primary}>
        Aller à la connexion
      </PrimaryBtn>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.tertiary, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
        Retour au choix du profil
      </button>
    </div>
  )

  // ── Formulaire principal ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, fontFamily: FONT }}>
      <StatusBar />

      {/* Back button */}
      <div style={{ padding: '6px 16px 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, display: 'flex', alignItems: 'center', gap: 6, color: C.blue, fontFamily: FONT, fontSize: 15, fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>
      </div>

      <div style={{ padding: '20px 22px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 18,
            background: isClient
              ? `linear-gradient(145deg,#1338A8,${C.blue})`
              : 'linear-gradient(145deg,#1C1C30,#2D2D48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            boxShadow: isClient ? `0 6px 20px ${C.blue}45` : SHADOW.md,
          }}>
            {isClient ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            )}
          </div>
          <h1 style={{ color: C.primary, fontSize: 30, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.9 }}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p style={{ color: C.secondary, fontSize: 15, margin: 0, fontWeight: 500 }}>
            {isClient ? 'Espace client' : 'Espace nettoyeur pro'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: C.fill, borderRadius: R.lg, padding: 4, marginBottom: 26 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); onClearUrlError?.() }} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: R.md, cursor: 'pointer',
              fontFamily: FONT, fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
              background: mode === m ? C.card : 'transparent',
              color: mode === m ? C.primary : C.secondary,
              boxShadow: mode === m ? SHADOW.sm : 'none',
            }}>
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <FieldCard style={{ marginBottom: 18 }}>
          {mode === 'register' && (
            <>
              <Field label="Nom complet" placeholder="Marie Dupont" value={form.name} onChange={v => set('name', v)} type="text" />
              <Divider />
            </>
          )}
          <Field label="Adresse e-mail" placeholder="email@exemple.com" value={form.email} onChange={v => set('email', v)} type="email" />
          <Divider />
          <Field label="Mot de passe" placeholder="8 caractères minimum" value={form.password} onChange={v => set('password', v)} type="password" />
          {mode === 'register' && (
            <>
              <Divider />
              <Field label="Téléphone" placeholder="+32 470 12 34 56" value={form.phone} onChange={v => set('phone', v)} type="tel" />
            </>
          )}
        </FieldCard>

        {/* Error states */}
        {error === 'otp_expired' && (
          <div style={{ background: '#FFFBEB', borderRadius: R.lg, padding: '16px', marginBottom: 16, border: '1px solid rgba(202,138,4,0.25)' }}>
            <p style={{ color: '#92400E', fontSize: 14, fontWeight: 700, margin: '0 0 5px' }}>Lien expiré</p>
            <p style={{ color: '#78350F', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
              Le lien de confirmation a expiré. Entrez votre email ci-dessus et renvoyez-en un nouveau.
            </p>
            {resendSent ? (
              <p style={{ color: C.green, fontSize: 13, fontWeight: 600, margin: 0 }}>Nouvel email envoyé !</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !form.email}
                style={{ background: '#92400E', border: 'none', borderRadius: R.md, padding: '9px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: resending || !form.email ? 'default' : 'pointer', fontFamily: FONT, opacity: resending || !form.email ? 0.5 : 1 }}>
                {resending ? 'Envoi…' : 'Renvoyer le lien'}
              </button>
            )}
          </div>
        )}
        {error === 'email_not_confirmed' && (
          <div style={{ background: '#FFFBEB', borderRadius: R.lg, padding: '16px', marginBottom: 16, border: '1px solid rgba(202,138,4,0.25)' }}>
            <p style={{ color: '#92400E', fontSize: 14, fontWeight: 700, margin: '0 0 5px' }}>Email non confirmé</p>
            <p style={{ color: '#78350F', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
              Cliquez sur le lien dans votre email avant de vous connecter.
            </p>
            {resendSent ? (
              <p style={{ color: C.green, fontSize: 13, fontWeight: 600, margin: 0 }}>Nouvel email envoyé !</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !form.email}
                style={{ background: 'none', border: `1px solid rgba(202,138,4,0.5)`, borderRadius: R.md, padding: '8px 14px', color: '#92400E', fontSize: 13, fontWeight: 600, cursor: resending || !form.email ? 'default' : 'pointer', fontFamily: FONT, opacity: resending || !form.email ? 0.5 : 1 }}>
                {resending ? 'Envoi…' : 'Renvoyer l\'email'}
              </button>
            )}
          </div>
        )}
        {error === 'invalid_credentials' && (
          <ErrorBox>Email ou mot de passe incorrect. Vérifiez vos identifiants.</ErrorBox>
        )}
        {error === 'already_registered' && (
          <ErrorBox>Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse.</ErrorBox>
        )}
        {error && error.startsWith('WRONG_ROLE:') && (
          <div style={{ background: '#FEF2F2', borderRadius: R.lg, padding: '16px', marginBottom: 16, border: '1px solid rgba(220,38,38,0.2)' }}>
            <p style={{ color: C.red, fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>
              {error.includes('client') ? 'Ce compte est un espace client' : 'Ce compte est un espace nettoyeur'}
            </p>
            <p style={{ color: '#991B1B', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
              {error.includes('client')
                ? 'Cet email est enregistré comme client. Retournez en arrière et choisissez "Je suis client".'
                : 'Cet email est enregistré comme nettoyeur. Retournez en arrière et choisissez "Je suis nettoyeur".'}
            </p>
            <button onClick={onBack} style={{ background: C.red, border: 'none', borderRadius: R.md, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              Retour au choix du profil
            </button>
          </div>
        )}
        {error && !['otp_expired', 'email_not_confirmed', 'invalid_credentials', 'already_registered'].includes(error) && !error.startsWith('WRONG_ROLE:') && (
          <ErrorBox>{error}</ErrorBox>
        )}

        {/* Submit */}
        <PrimaryBtn
          disabled={loading || !form.email || !form.password}
          onClick={handleAuth}
          accent={accent}
        >
          {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </PrimaryBtn>

        {/* Forgot password */}
        {mode === 'login' && (
          <p onClick={() => { setResetMode(true); setError(null); setResetEmail(form.email) }}
            style={{ textAlign: 'center', color: C.blue, fontSize: 14, marginTop: 18, cursor: 'pointer', fontWeight: 500 }}>
            Mot de passe oublié ?
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldCard({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, border: `1px solid ${C.separator}`, ...style }}>
      {children}
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type }) {
  return (
    <div style={{ padding: '13px 18px' }}>
      <label style={{ color: C.tertiary, fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: 'none', outline: 'none', fontSize: 16, color: C.primary, fontFamily: FONT, fontWeight: 400 }}
      />
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: C.separator, marginLeft: 18 }} />
}

function ErrorBox({ children }) {
  return (
    <div style={{ background: '#FEF2F2', borderRadius: R.lg, padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(220,38,38,0.18)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ color: '#991B1B', fontSize: 14, fontWeight: 500 }}>{children}</span>
    </div>
  )
}

function PrimaryBtn({ disabled, onClick, children, accent = C.primary }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        background: disabled ? C.fill : accent,
        border: 'none',
        borderRadius: R.xl,
        padding: '17px',
        color: disabled ? C.quaternary : '#fff',
        fontSize: 16,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: FONT,
        boxShadow: disabled ? 'none' : SHADOW.md,
        transition: 'all 0.15s',
        letterSpacing: -0.1,
      }}
    >
      {children}
    </button>
  )
}

function translateError(msg) {
  if (!msg) return 'Une erreur est survenue. Réessayez.'
  if (msg.startsWith('WRONG_ROLE:')) return `WRONG_ROLE:${msg.split(':')[1]}`
  if (msg.includes('Email not confirmed')) return 'email_not_confirmed'
  if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) return 'invalid_credentials'
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'already_registered'
  if (msg.includes('Password') || msg.includes('password')) return 'Le mot de passe doit faire au moins 6 caractères.'
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('email rate limit')) return 'Trop de tentatives. Réessayez dans quelques minutes.'
  // Erreurs réseau (Safari: "Load failed", Chrome: "Failed to fetch", Firefox: "NetworkError")
  if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) return 'Erreur réseau. Vérifiez votre connexion internet et réessayez.'
  return msg
}
