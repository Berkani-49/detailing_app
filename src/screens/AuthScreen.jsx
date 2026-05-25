import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, SHADOW, R, FONT, StatusBar } from '../components/Shared'

export default function AuthScreen({ role, onBack }) {
  const [mode,       setMode]       = useState('login')
  const [form,       setForm]       = useState({ email:'', password:'', name:'', phone:'' })
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [emailSent,  setEmailSent]  = useState(false)
  const [resetMode,  setResetMode]  = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent,  setResetSent]  = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // 'pro' from RoleScreen → 'detailer' in DB (constraint: client | detailer)
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
          email:    form.email,
          password: form.password,
          options:  {
            data: {
              full_name: form.name,
              role:      dbRole,
              phone:     form.phone,   // ← sauvegardé dans le trigger handle_new_user
            },
          },
        })
        if (error) throw error

        // Si session absente → email de confirmation envoyé
        if (data.user && !data.session) {
          setEmailSent(true)
        } else if (data.user && data.session && form.phone) {
          // Si email confirmation désactivé, on met à jour le profil directement
          await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
        }
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email:    form.email,
          password: form.password,
        })
        if (error) throw error

        // Vérifier que le rôle du compte correspond au portail choisi
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

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

  const handleReset = async () => {
    if (!resetEmail) return
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    })
    setResetLoading(false)
    if (error) {
      setError(translateError(error.message))
    } else {
      setResetSent(true)
    }
  }

  // ── Mot de passe oublié ─────────────────────────────────────────────────────
  if (resetMode) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT }}>
      <StatusBar />
      <div style={{ padding:'8px 20px 0', display:'flex', alignItems:'center' }}>
        <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(''); setError(null) }}
          style={{ background:'none', border:'none', cursor:'pointer', padding:8, display:'flex', alignItems:'center' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
      <div style={{ padding:'32px 24px 40px', display:'flex', flexDirection:'column', gap:20 }}>
        <div>
          <div style={{ width:52, height:52, borderRadius:18, background:'linear-gradient(145deg,#0050cc,#007AFF)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 4px 16px rgba(0,122,255,0.35)', fontSize:26 }}>
            🔑
          </div>
          <h1 style={{ color:C.primary, fontSize:28, fontWeight:800, margin:'0 0 6px', letterSpacing:-0.8 }}>Mot de passe oublié</h1>
          <p style={{ color:C.secondary, fontSize:15, margin:0 }}>
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {resetSent ? (
          <div style={{ background:'#F0FFF4', borderRadius:R.xl, padding:'20px', border:'1px solid rgba(52,199,89,0.25)', textAlign:'center', display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:36 }}>📬</span>
            <p style={{ color:C.green, fontSize:16, fontWeight:700, margin:0 }}>Email envoyé !</p>
            <p style={{ color:C.secondary, fontSize:14, margin:0, lineHeight:1.5 }}>
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        ) : (
          <>
            <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
              <Field
                label="Adresse e-mail"
                placeholder="email@exemple.com"
                value={resetEmail}
                onChange={setResetEmail}
                type="email"
              />
            </div>

            {error && (
              <div style={{ background:'#FFF2F2', borderRadius:R.md, padding:'12px 16px', border:'1px solid rgba(255,59,48,0.2)' }}>
                <span style={{ color:C.red, fontSize:14 }}>⚠ {error}</span>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={resetLoading || !resetEmail}
              style={{ width:'100%', background: resetLoading || !resetEmail ? C.fill : C.blue, border:'none', borderRadius:R.xl, padding:'17px', color: resetLoading || !resetEmail ? C.quaternary : '#fff', fontSize:17, fontWeight:700, cursor: resetLoading ? 'default' : 'pointer', fontFamily:FONT, boxShadow:SHADOW.lg, transition:'all 0.18s' }}
            >
              {resetLoading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </>
        )}

        {resetSent && (
          <button
            onClick={() => { setResetMode(false); setResetSent(false); setResetEmail('') }}
            style={{ width:'100%', background:C.primary, border:'none', borderRadius:R.xl, padding:'17px', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.md }}
          >
            Retour à la connexion
          </button>
        )}
      </div>
    </div>
  )

  // ── Email de confirmation envoyé ─────────────────────────────────────────
  if (emailSent) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px', gap:20 }}>
      <div style={{ width:80, height:80, borderRadius:R.full, background: isClient ? 'linear-gradient(145deg,#0050cc,#007AFF)' : 'linear-gradient(145deg,#2a2a38,#1C1C1E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:SHADOW.lg }}>
        📧
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 style={{ color:C.primary, fontSize:26, fontWeight:800, margin:'0 0 10px', letterSpacing:-0.5 }}>Vérifiez votre email</h2>
        <p style={{ color:C.secondary, fontSize:16, margin:'0 0 6px', lineHeight:1.5 }}>
          Un lien de confirmation a été envoyé à
        </p>
        <p style={{ color:C.primary, fontSize:16, fontWeight:700, margin:'0 0 20px' }}>{form.email}</p>
        <p style={{ color:C.tertiary, fontSize:14, margin:0, lineHeight:1.5 }}>
          Cliquez sur le lien dans l'email puis revenez ici pour vous connecter.
        </p>
      </div>
      <div style={{ width:'100%', background:C.card, borderRadius:R.xl, padding:'18px', boxShadow:SHADOW.sm }}>
        <p style={{ color:C.tertiary, fontSize:13, margin:'0 0 4px', fontWeight:600 }}>💡 Astuce</p>
        <p style={{ color:C.secondary, fontSize:13, margin:0, lineHeight:1.5 }}>
          Vérifiez aussi vos spams si vous ne trouvez pas l'email.
        </p>
      </div>
      <button onClick={() => { setEmailSent(false); setMode('login') }} style={{ background:C.primary, border:'none', borderRadius:R.xl, padding:'16px 36px', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.md }}>
        Aller à la connexion
      </button>
      <button onClick={onBack} style={{ background:'none', border:'none', color:C.tertiary, fontSize:14, cursor:'pointer', fontFamily:FONT }}>
        Retour au choix du profil
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding:'8px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', padding:8, display:'flex', alignItems:'center' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div style={{ padding:'24px 24px 40px' }}>
        {/* Title */}
        <div style={{ marginBottom:36 }}>
          <div style={{ width:52, height:52, borderRadius:18, background: isClient ? 'linear-gradient(145deg,#0050cc,#007AFF)' : 'linear-gradient(145deg,#2a2a38,#1C1C1E)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow: isClient ? '0 4px 16px rgba(0,122,255,0.35)' : SHADOW.md }}>
            {isClient ? (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            )}
          </div>
          <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:'0 0 6px', letterSpacing:-0.8 }}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p style={{ color:C.secondary, fontSize:16, margin:0 }}>
            {isClient ? 'Espace client' : 'Espace nettoyeur'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:C.fill, borderRadius:R.lg, padding:4, marginBottom:28 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
              flex:1, padding:'10px', border:'none', borderRadius:R.md, cursor:'pointer',
              fontFamily:FONT, fontSize:14, fontWeight:600, transition:'all 0.18s',
              background: mode === m ? C.card : 'transparent',
              color: mode === m ? C.primary : C.secondary,
              boxShadow: mode === m ? SHADOW.sm : 'none',
            }}>
              {m === 'login' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm, marginBottom:20 }}>
          {mode === 'register' && (
            <>
              <Field label="Nom complet" placeholder="Mathieu Bernard" value={form.name} onChange={v => set('name', v)} type="text" />
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
        </div>

        {/* Error messages */}
        {error === 'email_not_confirmed' && (
          <div style={{ background:'#FFF8E8', borderRadius:R.md, padding:'14px 16px', marginBottom:16, border:'1px solid rgba(255,149,0,0.25)' }}>
            <p style={{ color:'#CC7A00', fontSize:14, fontWeight:700, margin:'0 0 6px' }}>📧 Email non confirmé</p>
            <p style={{ color:'#996600', fontSize:13, margin:'0 0 10px', lineHeight:1.5 }}>
              Cliquez sur le lien dans votre email avant de vous connecter.
            </p>
            <p style={{ color:'#996600', fontSize:12, margin:0 }}>
              Conseil : dans Supabase → Authentication → Email → désactivez <strong>"Confirm email"</strong> pour le développement.
            </p>
          </div>
        )}
        {error === 'invalid_credentials' && (
          <div style={{ background:'#FFF2F2', borderRadius:R.md, padding:'14px 16px', marginBottom:16, border:'1px solid rgba(255,59,48,0.2)' }}>
            <p style={{ color:C.red, fontSize:14, fontWeight:700, margin:'0 0 4px' }}>Email ou mot de passe incorrect</p>
            <p style={{ color:'#CC0000', fontSize:13, margin:0, lineHeight:1.5 }}>
              Vérifiez vos identifiants ou confirmez d'abord votre email.
            </p>
          </div>
        )}
        {error === 'already_registered' && (
          <div style={{ background:'#FFF2F2', borderRadius:R.md, padding:'14px 16px', marginBottom:16, border:'1px solid rgba(255,59,48,0.2)' }}>
            <p style={{ color:C.red, fontSize:14, fontWeight:700, margin:'0 0 4px' }}>Adresse email déjà utilisée</p>
            <p style={{ color:'#CC0000', fontSize:13, margin:0, lineHeight:1.5 }}>
              Un compte existe déjà avec cet email. Utilisez "Se connecter" ou choisissez une autre adresse.
            </p>
          </div>
        )}
        {error && error.startsWith('WRONG_ROLE:') && (
          <div style={{ background:'#FFF2F2', borderRadius:R.md, padding:'16px', marginBottom:16, border:'1px solid rgba(255,59,48,0.2)' }}>
            <p style={{ color:C.red, fontSize:14, fontWeight:700, margin:'0 0 6px' }}>
              {error.includes('client') ? '🚗 Ce compte est un espace client' : '🔧 Ce compte est un espace nettoyeur'}
            </p>
            <p style={{ color:'#CC0000', fontSize:13, margin:'0 0 12px', lineHeight:1.5 }}>
              {error.includes('client')
                ? 'Cet email est enregistré comme client. Retournez en arrière et choisissez "Je suis client".'
                : 'Cet email est enregistré comme nettoyeur. Retournez en arrière et choisissez "Je suis nettoyeur".'}
            </p>
            <button onClick={onBack} style={{ background:C.red, border:'none', borderRadius:R.md, padding:'10px 18px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
              ← Retour au choix du profil
            </button>
          </div>
        )}
        {error && !['email_not_confirmed','invalid_credentials','already_registered'].includes(error) && !error.startsWith('WRONG_ROLE:') && (
          <div style={{ background:'#FFF2F2', borderRadius:R.md, padding:'12px 16px', marginBottom:16, border:'1px solid rgba(255,59,48,0.2)' }}>
            <span style={{ color:C.red, fontSize:14, fontWeight:500 }}>⚠ {error}</span>
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading || !form.email || !form.password}
          style={{
            width:'100%', background: loading || !form.email || !form.password ? C.fill : accent,
            border:'none', borderRadius:R.xl, padding:'17px',
            color: loading || !form.email || !form.password ? C.quaternary : '#fff',
            fontSize:17, fontWeight:700, cursor: loading ? 'default' : 'pointer',
            fontFamily:FONT, boxShadow: !loading ? SHADOW.lg : 'none',
            transition:'all 0.18s',
          }}
        >
          {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>

        {mode === 'login' && (
          <p
            onClick={() => { setResetMode(true); setError(null); setResetEmail(form.email) }}
            style={{ textAlign:'center', color:C.blue, fontSize:14, marginTop:18, cursor:'pointer' }}
          >
            Mot de passe oublié ?
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type }) {
  return (
    <div style={{ padding:'14px 18px' }}>
      <label style={{ color:C.tertiary, fontSize:11, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:6 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width:'100%', boxSizing:'border-box', background:'none', border:'none', outline:'none', fontSize:16, color:C.primary, fontFamily:FONT }}
      />
    </div>
  )
}

function Divider() {
  return <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />
}

function translateError(msg) {
  if (msg.startsWith('WRONG_ROLE:'))
    return `WRONG_ROLE:${msg.split(':')[1]}`
  if (msg.includes('Email not confirmed'))
    return 'email_not_confirmed'
  if (msg.includes('Invalid login') || msg.includes('invalid_credentials'))
    return 'invalid_credentials'
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'already_registered'
  if (msg.includes('Password') || msg.includes('password'))
    return 'Le mot de passe doit faire au moins 6 caractères.'
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit'))
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return msg
}
