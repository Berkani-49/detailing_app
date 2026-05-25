import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { C, SHADOW, R, FONT, StatusBar, PillTabs, SectionHeader, CarSVG, Stars, Spinner, svcGrad, EmptyState, Badge } from './components/Shared'
import RoleScreen       from './screens/RoleScreen'
import AuthScreen       from './screens/AuthScreen'
import NearbyScreen     from './screens/client/NearbyScreen'
import DetailerScreen   from './screens/client/DetailerScreen'
import BookingsScreen   from './screens/client/BookingsScreen'
import ProHome          from './screens/pro/ProHome'

// ─── NAVIGATION CONFIGS ───────────────────────────────────────────────────────
const CLIENT_TABS = [
  { id:'home',     label:'Accueil',  d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { id:'explore',  label:'Explorer', d:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { id:'bookings', label:'Mes RDV',  d:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { id:'profile',  label:'Profil',   d:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]

const PRO_TABS = [
  { id:'home',     label:'Accueil',  d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { id:'services', label:'Services', d:'M4 6h16M4 12h16M4 18h16' },
  { id:'booking',  label:'Agenda',   d:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
  { id:'tracking', label:'Suivi',    d:'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3' },
  { id:'admin',    label:'Profil',   d:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]

function NavBar({ tabs, active, onChange, accentColor }) {
  return (
    <nav style={{ flexShrink:0, background:'rgba(249,249,249,0.98)', borderTop:`0.5px solid ${C.separator}`, display:'flex', padding:'10px 0 28px', justifyContent:'space-around' }}>
      {tabs.map(n => {
        const on = n.id === active
        return (
          <button key={n.id} onClick={() => onChange(n.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:'4px 10px', minWidth:56 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={on ? (accentColor || C.primary) : C.quaternary} strokeWidth={on ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={n.d}/>
            </svg>
            <span style={{ fontSize:10, fontWeight:600, color: on ? (accentColor || C.primary) : C.quaternary, fontFamily:FONT }}>{n.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── LOADING ─────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:'#09090F', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, fontFamily:FONT }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(145deg,#141424,#1e1e38)', border:'1px solid rgba(255,255,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
          <path d="M4 31L10 31L10 26Q14 17 24 13L37 13Q47 13 47 25L47 31L49 31" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="15" cy="34" r="5" fill="none" stroke="white" strokeWidth="2.2"/>
          <circle cx="36" cy="34" r="5" fill="none" stroke="white" strokeWidth="2.2"/>
          <circle cx="29" cy="7" r="3.5" fill="#007AFF"/>
        </svg>
      </div>
      <div style={{ width:40, height:40, borderRadius:40, border:'3px solid rgba(255,255,255,0.08)', borderTop:'3px solid #007AFF', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>DetailPro</p>
    </div>
  )
}

// ─── CLIENT HOME (featured + quick access) ───────────────────────────────────
function ClientHome({ profile, onExplore, onProfile }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const featured = [
    { name:'Lavage Extérieur Pro',    price:79,  duration:'1h30', rating:4.8, city:'Bruxelles' },
    { name:'Full Detailing',          price:249, duration:'4h',   rating:4.9, city:'Anvers'    },
    { name:'Traitement Céramique 9H', price:549, duration:'8h',   rating:5.0, city:'Gand'      },
  ]

  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 22px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ color:C.tertiary, fontSize:14, margin:'0 0 3px' }}>{greeting} 👋</p>
          <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:'0 0 2px', letterSpacing:-0.8 }}>{profile.full_name || 'Bienvenue'}</h1>
          <p style={{ color:C.secondary, fontSize:15, margin:0 }}>Belgique · France · Pays-Bas · Luxembourg · Allemagne</p>
        </div>
        <button onClick={onProfile} style={{ marginTop:6, width:42, height:42, borderRadius:R.full, background:C.card, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:SHADOW.sm, flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>

      {/* Search → go to explore */}
      <div style={{ padding:'0 20px 24px' }}>
        <button onClick={onExplore} style={{ width:'100%', background:C.card, border:'none', borderRadius:R.lg, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, boxShadow:SHADOW.sm, cursor:'pointer', fontFamily:FONT, textAlign:'left' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.quaternary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span style={{ color:C.quaternary, fontSize:16 }}>Trouver un nettoyeur près de vous…</span>
        </button>
      </div>

      {/* Countries quick filter */}
      <div style={{ padding:'0 20px 24px' }}>
        <SectionHeader title="Zones couvertes" />
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[['🇧🇪','Belgique'],['🇫🇷','France'],['🇳🇱','Pays-Bas'],['🇱🇺','Luxembourg'],['🇩🇪','Allemagne']].map(([f, c]) => (
            <button key={c} onClick={onExplore} style={{ background:C.card, border:'none', borderRadius:R.lg, padding:'10px 16px', display:'flex', alignItems:'center', gap:8, boxShadow:SHADOW.sm, cursor:'pointer', fontFamily:FONT }}>
              <span style={{ fontSize:20 }}>{f}</span>
              <span style={{ color:C.primary, fontSize:14, fontWeight:600 }}>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured services preview */}
      <div style={{ padding:'0 20px' }}>
        <SectionHeader title="Services populaires" action="Explorer →" onAction={onExplore} />
        <div className="no-scroll" style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:4 }}>
          {featured.map((s, i) => (
            <div key={i} onClick={onExplore} style={{ width:200, flexShrink:0, background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.md, cursor:'pointer' }}>
              <div style={{ height:100, background:svcGrad(s.name), display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CarSVG opacity={0.15} w="70%" />
              </div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ color:C.primary, fontSize:14, fontWeight:700, marginBottom:3 }}>{s.name}</div>
                <div style={{ color:C.secondary, fontSize:12 }}>{s.city} · {s.duration}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <Stars rating={s.rating} size={11} />
                    <span style={{ color:C.secondary, fontSize:11 }}>{s.rating}</span>
                  </div>
                  <span style={{ color:C.primary, fontSize:16, fontWeight:800 }}>dès {s.price}€</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding:'28px 20px 24px' }}>
        <SectionHeader title="Comment ça marche ?" />
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { n:'1', t:'Activez votre position', d:'Trouvez les nettoyeurs dans votre ville ou rayon choisi', c:C.blue   },
            { n:'2', t:'Choisissez un nettoyeur', d:'Comparez les services, tarifs et avis clients',          c:C.indigo },
            { n:'3', t:'Réservez en ligne',       d:'Choisissez votre créneau et confirmez en 1 clic',        c:C.green  },
          ].map(s => (
            <div key={s.n} style={{ background:C.card, borderRadius:R.lg, padding:'16px', boxShadow:SHADOW.sm, display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:36, height:36, borderRadius:R.full, background:`${s.c}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:s.c, fontSize:16, fontWeight:800 }}>{s.n}</span>
              </div>
              <div>
                <div style={{ color:C.primary, fontSize:15, fontWeight:700 }}>{s.t}</div>
                <div style={{ color:C.secondary, fontSize:13, marginTop:3 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CLIENT PROFILE ───────────────────────────────────────────────────────────
function ClientProfile({ profile, onLogout, onBack, onProfileUpdate }) {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone:     profile.phone     || '',
    address:   localStorage.getItem('client_address')  || '',
    vehicle:   localStorage.getItem('client_vehicle')  || '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', profile.id)
    localStorage.setItem('client_address', form.address)
    localStorage.setItem('client_vehicle', form.vehicle)
    onProfileUpdate?.({ full_name: form.full_name, phone: form.phone })
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const PERSONAL_FIELDS = [
    { key:'full_name', label:'Nom complet',   placeholder:'Jean Dupont',                  icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { key:'phone',     label:'Téléphone',     placeholder:'+32 4XX XX XX XX',             icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.123.96.358 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.342 1.85.577 2.81.7A2 2 0 0 1 22 16.92z' },
    { key:'address',   label:'Adresse',       placeholder:'Rue de la Paix 1, 1000 Bruxelles', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  ]

  const inputStyle = {
    width:'100%', background:C.fill2, border:`1.5px solid ${C.separator}`,
    borderRadius:R.sm, padding:'9px 12px', fontSize:15, color:C.primary,
    fontFamily:FONT, outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>

      {/* Header */}
      <div style={{ padding:'8px 20px 18px' }}>
        {onBack && (
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 14px', fontWeight:600 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Accueil
          </button>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:0, letterSpacing:-0.8 }}>Mon Profil</h1>
          <button
            onClick={() => { setEditing(e => !e); setSaved(false) }}
            style={{ background: editing ? C.fill : C.blue, border:'none', borderRadius:R.lg, padding:'9px 20px', color: editing ? C.primary : '#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT }}
          >
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      {/* Avatar card */}
      <div style={{ margin:'0 20px 20px', background:C.card, borderRadius:R.xxl, padding:'22px', boxShadow:SHADOW.md, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ width:64, height:64, borderRadius:R.full, background:'linear-gradient(145deg,#007AFF,#5856D6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff', fontWeight:800, flexShrink:0, letterSpacing:-1 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:C.primary, fontSize:20, fontWeight:800, letterSpacing:-0.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{form.full_name || 'Mon profil'}</div>
          <div style={{ color:C.secondary, fontSize:14, marginTop:3 }}>{profile.email}</div>
          <div style={{ marginTop:10 }}><Badge label="Client DetailPro" color={C.blue} /></div>
        </div>
      </div>

      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Informations personnelles */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
            <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Informations personnelles</span>
          </div>
          {PERSONAL_FIELDS.map(({ key, label, placeholder, icon }, i, arr) => (
            <div key={key}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px' }}>
                <div style={{ width:36, height:36, borderRadius:R.sm, background:C.fill2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={C.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.tertiary, fontSize:12, marginBottom:4 }}>{label}</div>
                  {editing
                    ? <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inputStyle} />
                    : <div style={{ color: form[key] ? C.primary : C.quaternary, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{form[key] || placeholder}</div>
                  }
                </div>
              </div>
              {i < arr.length - 1 && <div style={{ height:0.5, background:C.separator, marginLeft:68 }} />}
            </div>
          ))}
        </div>

        {/* Mon véhicule */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
            <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Mon véhicule</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px' }}>
            <div style={{ width:36, height:36, borderRadius:R.sm, background:C.fill2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg viewBox="0 0 48 48" width="20" height="20" fill="none">
                <path d="M6 30L10 30L10 25Q14 18 22 15L34 15Q44 15 44 25L44 30L46 30" stroke={C.secondary} strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="16" cy="33" r="5" fill="none" stroke={C.secondary} strokeWidth="3"/>
                <circle cx="36" cy="33" r="5" fill="none" stroke={C.secondary} strokeWidth="3"/>
              </svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:C.tertiary, fontSize:12, marginBottom:4 }}>Marque, modèle &amp; immatriculation</div>
              {editing
                ? <input value={form.vehicle} onChange={set('vehicle')} placeholder="BMW Série 3 · 1-ABC-234" style={inputStyle} />
                : <div style={{ color: form.vehicle ? C.primary : C.quaternary, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{form.vehicle || 'BMW Série 3 · 1-ABC-234'}</div>
              }
            </div>
          </div>
        </div>

        {/* Save */}
        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width:'100%', background:C.primary, border:'none', borderRadius:R.xl, padding:'17px', color:'#fff', fontSize:16, fontWeight:700, cursor: saving ? 'wait' : 'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        )}

        {/* Success banner */}
        {saved && (
          <div style={{ background:'#F0FFF4', borderRadius:R.lg, padding:'14px 18px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(52,199,89,0.25)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color:C.green, fontSize:14, fontWeight:600 }}>Profil mis à jour avec succès</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{ width:'100%', background:C.card, border:'none', borderRadius:R.xl, padding:'17px', color:C.red, fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Se déconnecter
        </button>

      </div>
    </div>
  )
}

// ─── PRO SERVICES (manage own) ────────────────────────────────────────────────
const SVC_CATEGORIES = ['Extérieur','Intérieur','Céramique','Premium']

function ProServices({ detailer, onBack }) {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)  // null | 'new' | serviceObj
  const [saving,   setSaving]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)

  const emptyForm = { name:'', description:'', price:'', duration_minutes:'', category:'Extérieur', active:true }
  const [form, setForm] = useState(emptyForm)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!detailer) { setLoading(false); return }
    fetchServices()
  }, [detailer?.id])

  const fetchServices = () =>
    supabase.from('services').select('*').eq('detailer_id', detailer.id).order('category').order('price')
      .then(({ data }) => { setServices(data || []); setLoading(false) })

  const openNew  = () => { setForm(emptyForm); setEditing('new') }
  const openEdit = s  => { setForm({ name:s.name, description:s.description||'', price:String(s.price), duration_minutes:String(s.duration_minutes), category:s.category, active:s.active }); setEditing(s) }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration_minutes) return
    setSaving(true)
    const payload = { detailer_id:detailer.id, name:form.name, description:form.description||null, price:parseFloat(form.price), duration_minutes:parseInt(form.duration_minutes), category:form.category, active:form.active }
    if (editing === 'new') {
      const { data } = await supabase.from('services').insert(payload).select().single()
      if (data) setServices(s => [...s, data])
    } else {
      const { data } = await supabase.from('services').update(payload).eq('id', editing.id).select().single()
      if (data) setServices(s => s.map(x => x.id === data.id ? data : x))
    }
    setSaving(false); setEditing(null)
  }

  const handleToggle = async (s) => {
    await supabase.from('services').update({ active: !s.active }).eq('id', s.id)
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, active: !s.active } : x))
  }

  const handleDelete = async (id) => {
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(x => x.id !== id))
    setConfirmDel(null)
  }

  if (!detailer) return <EmptyState icon="🔧" title="Profil incomplet" subtitle="Configurez votre profil nettoyeur d'abord dans l'onglet Profil" />

  const inputStyle = { width:'100%', background:C.fill2, border:`1.5px solid ${C.separator}`, borderRadius:R.sm, padding:'10px 12px', fontSize:15, color:C.primary, fontFamily:FONT, outline:'none', boxSizing:'border-box' }

  // ── Formulaire ajout/édition ──
  if (editing !== null) return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 20px' }}>
        <button onClick={() => setEditing(null)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 14px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Mes services
        </button>
        <h1 style={{ color:C.primary, fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.6 }}>
          {editing === 'new' ? 'Nouveau service' : 'Modifier le service'}
        </h1>
      </div>

      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          {[
            { k:'name',             label:'Nom du service *',   ph:'Lavage Extérieur Pro',  type:'text'   },
            { k:'description',      label:'Description',        ph:'Détail de la prestation…', type:'text' },
            { k:'price',            label:'Prix (€) *',         ph:'79',                    type:'number' },
            { k:'duration_minutes', label:'Durée (minutes) *',  ph:'90',                    type:'number' },
          ].map(({ k, label, ph, type }, i, arr) => (
            <div key={k}>
              <div style={{ padding:'14px 18px' }}>
                <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</div>
                <input value={form[k]} onChange={setF(k)} placeholder={ph} type={type} min={type==='number'?'0':undefined}
                  style={inputStyle} />
              </div>
              {i < arr.length-1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
            </div>
          ))}
          <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />
          <div style={{ padding:'14px 18px' }}>
            <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Catégorie</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {SVC_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category:cat }))} style={{ padding:'8px 18px', border:'none', borderRadius:R.full, cursor:'pointer', fontFamily:FONT, fontSize:13, fontWeight:600, background: form.category===cat ? C.primary : C.fill2, color: form.category===cat ? '#fff' : C.secondary }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />
          <div style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ color:C.primary, fontSize:15, fontWeight:600 }}>Service actif</div>
              <div style={{ color:C.tertiary, fontSize:13 }}>Visible par les clients</div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, active:!f.active }))} style={{ width:50, height:28, borderRadius:14, border:'none', cursor:'pointer', background: form.active ? C.green : C.quaternary, transition:'background 0.2s', position:'relative' }}>
              <div style={{ width:22, height:22, borderRadius:11, background:'#fff', position:'absolute', top:3, left: form.active ? 25 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.duration_minutes}
          style={{ width:'100%', background: (!form.name||!form.price||!form.duration_minutes) ? C.fill : C.primary, border:'none', borderRadius:R.xl, padding:'17px', color: (!form.name||!form.price||!form.duration_minutes) ? C.quaternary : '#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, opacity:saving?0.7:1 }}>
          {saving ? 'Enregistrement…' : editing === 'new' ? 'Ajouter le service ✓' : 'Enregistrer les modifications'}
        </button>

        {editing !== 'new' && (
          confirmDel === editing?.id ? (
            <div style={{ background:'#FFF2F2', borderRadius:R.xl, padding:'18px', border:'1px solid rgba(255,59,48,0.2)' }}>
              <div style={{ color:C.red, fontSize:15, fontWeight:700, marginBottom:12 }}>Supprimer ce service ?</div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setConfirmDel(null)} style={{ flex:1, background:C.fill, border:'none', borderRadius:R.lg, padding:'12px', color:C.primary, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>Annuler</button>
                <button onClick={() => handleDelete(editing.id)} style={{ flex:1, background:C.red, border:'none', borderRadius:R.lg, padding:'12px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>Supprimer</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(editing.id)} style={{ width:'100%', background:C.card, border:'none', borderRadius:R.xl, padding:'16px', color:C.red, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm }}>
              Supprimer ce service
            </button>
          )
        )}
      </div>
    </div>
  )

  // ── Liste des services ──
  const grouped = SVC_CATEGORIES.reduce((acc, cat) => {
    const list = services.filter(s => s.category === cat)
    if (list.length) acc[cat] = list
    return acc
  }, {})

  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 20px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 12px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Accueil
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:0, letterSpacing:-0.8 }}>Mes Services</h1>
            <p style={{ color:C.secondary, fontSize:14, margin:'4px 0 0' }}>{services.filter(s=>s.active).length} actif{services.filter(s=>s.active).length!==1?'s':''} · {services.length} au total</p>
          </div>
          <button onClick={openNew} style={{ background:C.primary, border:'none', borderRadius:R.lg, padding:'11px 20px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm }}>
            + Ajouter
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : services.length === 0 ? (
        <EmptyState icon="✨" title="Aucun service" subtitle="Ajoutez vos premières prestations pour commencer à recevoir des réservations" action="+ Ajouter un service" onAction={openNew} />
      ) : (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:20 }}>
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <div style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, marginBottom:10 }}>{cat}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {list.map(s => {
                  const mins = s.duration_minutes
                  const dur  = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60?String(mins%60).padStart(2,'0'):''}` : `${mins}min`
                  return (
                    <div key={s.id} onClick={() => openEdit(s)} style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm, display:'flex', cursor:'pointer', opacity: s.active ? 1 : 0.55 }}>
                      <div style={{ width:5, background:svcGrad(s.name), flexShrink:0 }}/>
                      <div style={{ flex:1, padding:'15px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:C.primary, fontSize:16, fontWeight:700 }}>{s.name}</div>
                          <div style={{ color:C.secondary, fontSize:13, marginTop:3 }}>{dur} · {s.category}</div>
                          {s.description && <div style={{ color:C.tertiary, fontSize:12, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.description}</div>}
                        </div>
                        <div style={{ textAlign:'right', marginLeft:12, flexShrink:0 }}>
                          <div style={{ color:C.primary, fontSize:22, fontWeight:800, lineHeight:1 }}>{s.price}<span style={{ fontSize:13, fontWeight:500 }}>€</span></div>
                          <button onClick={e => { e.stopPropagation(); handleToggle(s) }} style={{ marginTop:6, background: s.active ? '#E8FFF1' : C.fill2, border:'none', borderRadius:R.full, padding:'3px 10px', color: s.active ? C.green : C.tertiary, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
                            {s.active ? 'Actif' : 'Inactif'}
                          </button>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', paddingRight:14 }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.quaternary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PRO TRACKING ─────────────────────────────────────────────────────────────
const TRACK_STATUS = {
  pending:     { label:'En attente',  color:C.orange, next:'confirmed',   nextLabel:'Confirmer'  },
  confirmed:   { label:'Confirmé',    color:C.blue,   next:'in_progress', nextLabel:'Démarrer'   },
  in_progress: { label:'En cours',    color:C.indigo, next:'completed',   nextLabel:'Terminer'   },
  completed:   { label:'Terminé',     color:C.green,  next:null,          nextLabel:null         },
  cancelled:   { label:'Annulé',      color:C.red,    next:null,          nextLabel:null         },
}

function ProTracking({ detailer, onBack }) {
  const [tab,      setTab]      = useState('active')
  const [active,   setActive]   = useState([])
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!detailer) { setLoading(false); return }
    fetchAll()
  }, [detailer?.id])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: act }, { data: hist }] = await Promise.all([
      supabase.from('bookings')
        .select('*, services(name, duration_minutes, price), profiles(full_name, phone)')
        .eq('detailer_id', detailer.id)
        .in('status', ['pending','confirmed','in_progress'])
        .order('scheduled_date').order('scheduled_time'),
      supabase.from('bookings')
        .select('*, services(name, duration_minutes, price), profiles(full_name, phone)')
        .eq('detailer_id', detailer.id)
        .in('status', ['completed','cancelled'])
        .order('scheduled_date', { ascending: false })
        .limit(30),
    ])
    setActive(act || [])
    setHistory(hist || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    if (status === 'completed' || status === 'cancelled') {
      const moved = active.find(b => b.id === id)
      if (moved) {
        setActive(prev => prev.filter(b => b.id !== id))
        setHistory(prev => [{ ...moved, status }, ...prev])
      }
    } else {
      setActive(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    }
  }

  if (!detailer) return <EmptyState icon="🔧" title="Profil incomplet" subtitle="Configurez votre profil nettoyeur dans l'onglet Profil" />

  const list = tab === 'active' ? active : history

  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 16px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 12px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Accueil
        </button>
        <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:'0 0 3px', letterSpacing:-0.8 }}>Réservations</h1>
        <p style={{ color:C.secondary, fontSize:14, margin:0 }}>{active.length} actif{active.length!==1?'s':''} · {history.length} terminé{history.length!==1?'s':''}</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:C.fill, borderRadius:R.lg, margin:'0 20px 20px', padding:4 }}>
        {[['active','Actifs & En attente'],['history','Historique']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:R.md, cursor:'pointer', fontFamily:FONT, fontSize:14, fontWeight:600, transition:'all 0.18s', background: tab===id ? C.card : 'transparent', color: tab===id ? C.primary : C.secondary, boxShadow: tab===id ? SHADOW.sm : 'none' }}>
            {label}{tab===id && list.length > 0 ? ` (${list.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? '✅' : '📋'}
          title={tab === 'active' ? 'Aucun RDV actif' : 'Aucun historique'}
          subtitle={tab === 'active' ? 'Tout est à jour ! Les nouvelles réservations apparaîtront ici.' : 'Vos RDV terminés et annulés apparaîtront ici.'}
        />
      ) : (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {list.map(b => {
            const cfg     = TRACK_STATUS[b.status] || TRACK_STATUS.pending
            const mins    = b.services?.duration_minutes
            const dur     = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60?String(mins%60).padStart(2,'0'):''}` : `${mins}min`
            const dateStr = new Date(b.scheduled_date+'T00:00').toLocaleDateString('fr-BE', { weekday:'short', day:'numeric', month:'long' })
            const isPast  = tab === 'history'
            return (
              <div key={b.id} style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.md, opacity: b.status === 'cancelled' ? 0.65 : 1 }}>
                <div style={{ height:4, background:cfg.color }}/>
                <div style={{ padding:'18px' }}>
                  {/* Top row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ color:C.primary, fontSize:17, fontWeight:700 }}>{b.profiles?.full_name || 'Client'}</div>
                      <div style={{ color:C.secondary, fontSize:13, marginTop:2 }}>{b.services?.name} · {dur}</div>
                      <div style={{ color:C.tertiary, fontSize:13, marginTop:2 }}>{dateStr} à {b.scheduled_time?.slice(0,5)}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                      <div style={{ background:`${cfg.color}18`, borderRadius:R.full, padding:'4px 12px' }}>
                        <span style={{ color:cfg.color, fontSize:12, fontWeight:700 }}>{cfg.label}</span>
                      </div>
                      <div style={{ color:C.primary, fontSize:16, fontWeight:800 }}>{b.total_price} €</div>
                    </div>
                  </div>

                  {/* Details */}
                  {(b.vehicle || b.profiles?.phone) && (
                    <div style={{ background:C.fill2, borderRadius:R.md, padding:'10px 14px', marginBottom:12, display:'flex', flexDirection:'column', gap:4 }}>
                      {b.vehicle    && <div style={{ color:C.secondary, fontSize:13 }}>🚗 {b.vehicle}</div>}
                      {b.profiles?.phone && <div style={{ color:C.blue, fontSize:13 }}>📞 {b.profiles.phone}</div>}
                      {b.notes      && <div style={{ color:C.tertiary, fontSize:12 }}>📝 {b.notes}</div>}
                    </div>
                  )}

                  {/* Actions (only for active) */}
                  {!isPast && (
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ flex:1, background:'#FFF2F2', border:'none', borderRadius:R.md, padding:'11px', color:C.red, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
                        Annuler
                      </button>
                      {cfg.next && (
                        <button onClick={() => updateStatus(b.id, cfg.next)} style={{ flex:2, background:C.primary, border:'none', borderRadius:R.md, padding:'11px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
                          {cfg.nextLabel} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── PRO BOOKING / AGENDA ─────────────────────────────────────────────────────
const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const DOW_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const MON_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

function ProBooking({ detailer, profile, onBack }) {
  const [view,        setView]       = useState('agenda')   // 'agenda' | 'new'
  const [weekOffset,  setWeekOffset] = useState(0)
  const [bookings,    setBookings]   = useState([])
  const [services,    setServices]   = useState([])
  const [loading,     setLoading]    = useState(true)
  const [saving,      setSaving]     = useState(false)
  const [savedMsg,    setSavedMsg]   = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)

  const emptyForm = { client_name:'', client_phone:'', vehicle:'', service_id:'', date:'', time:'', notes:'' }
  const [form, setForm] = useState(emptyForm)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const getWeekDates = (offset = weekOffset) => {
    const dates = []
    const today = new Date()
    const mon   = new Date(today)
    mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7)
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const weekDates = getWeekDates()
  const todayISO  = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!detailer) { setLoading(false); return }
    fetchAll()
  }, [detailer?.id, weekOffset])

  const fetchAll = async () => {
    setLoading(true)
    const start = weekDates[0].toISOString().split('T')[0]
    const end   = weekDates[6].toISOString().split('T')[0]
    const [{ data: bk }, { data: sv }] = await Promise.all([
      supabase.from('bookings')
        .select('*, services(name, duration_minutes, price), profiles(full_name)')
        .eq('detailer_id', detailer.id)
        .gte('scheduled_date', start).lte('scheduled_date', end)
        .neq('status', 'cancelled').order('scheduled_time'),
      supabase.from('services').select('*').eq('detailer_id', detailer.id).eq('active', true).order('price'),
    ])
    setBookings(bk || [])
    setServices(sv || [])
    setLoading(false)
  }

  const openNew = (dateISO = '') => {
    setForm({ ...emptyForm, date: dateISO })
    setView('new')
  }

  const handleCreate = async () => {
    if (!form.service_id || !form.date || !form.time) return
    setSaving(true)
    const svc     = services.find(s => s.id === form.service_id)
    const notes   = `[Manuel] ${form.client_name ? 'Client : ' + form.client_name : ''}${form.client_phone ? ' · ' + form.client_phone : ''}${form.notes ? ' · ' + form.notes : ''}`
    await supabase.from('bookings').insert({
      client_id:      profile.id,
      detailer_id:    detailer.id,
      service_id:     form.service_id,
      vehicle:        form.vehicle || 'Non précisé',
      scheduled_date: form.date,
      scheduled_time: form.time + ':00',
      status:         'confirmed',
      notes:          notes.trim(),
      total_price:    svc?.price || 0,
    })
    setSaving(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
    setView('agenda')
    fetchAll()
  }

  if (!detailer) return <EmptyState icon="🔧" title="Profil incomplet" subtitle="Configurez votre profil nettoyeur dans l'onglet Profil" />

  const inputStyle = { width:'100%', background:C.fill2, border:`1.5px solid ${C.separator}`, borderRadius:R.sm, padding:'10px 12px', fontSize:15, color:C.primary, fontFamily:FONT, outline:'none', boxSizing:'border-box' }

  // ── Formulaire nouveau RDV ──
  if (view === 'new') return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 20px' }}>
        <button onClick={() => setView('agenda')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 14px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Agenda
        </button>
        <h1 style={{ color:C.primary, fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.6 }}>Nouveau RDV</h1>
        <p style={{ color:C.secondary, fontSize:14, margin:'4px 0 0' }}>Créez un rendez-vous manuellement</p>
      </div>

      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Service */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
            <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Prestation *</span>
          </div>
          <div style={{ padding:'14px 18px' }}>
            {services.length === 0 ? (
              <p style={{ color:C.tertiary, fontSize:14, margin:0 }}>Aucun service actif. Ajoutez-en dans l'onglet Services.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {services.map(s => {
                  const mins = s.duration_minutes
                  const dur  = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60?String(mins%60).padStart(2,'0'):''}` : `${mins}min`
                  const sel  = form.service_id === s.id
                  return (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, service_id: s.id }))} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background: sel ? C.primary : C.fill2, border: sel ? 'none' : `1.5px solid ${C.separator}`, borderRadius:R.lg, padding:'12px 16px', cursor:'pointer', fontFamily:FONT, transition:'all 0.15s' }}>
                      <div style={{ textAlign:'left' }}>
                        <div style={{ color: sel ? '#fff' : C.primary, fontSize:15, fontWeight:700 }}>{s.name}</div>
                        <div style={{ color: sel ? 'rgba(255,255,255,0.6)' : C.secondary, fontSize:12, marginTop:2 }}>{dur} · {s.category}</div>
                      </div>
                      <div style={{ color: sel ? '#fff' : C.primary, fontSize:18, fontWeight:800 }}>{s.price}€</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date & Heure */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
            <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Date & Heure *</span>
          </div>
          <div style={{ padding:'14px 18px' }}>
            <div style={{ color:C.tertiary, fontSize:12, marginBottom:6 }}>Date</div>
            <input type="date" value={form.date} onChange={setF('date')} min={todayISO} style={inputStyle} />
          </div>
          <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />
          <div style={{ padding:'14px 18px' }}>
            <div style={{ color:C.tertiary, fontSize:12, marginBottom:10 }}>Créneau horaire</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {SLOTS.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, time:s }))} style={{ padding:'10px 4px', border:'none', borderRadius:R.md, cursor:'pointer', fontFamily:FONT, fontSize:14, fontWeight:700, background: form.time===s ? C.primary : C.fill2, color: form.time===s ? '#fff' : C.primary }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Infos client */}
        <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
          <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
            <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Informations client</span>
          </div>
          {[
            { k:'client_name',  label:'Nom du client',  ph:'Jean Dupont'         },
            { k:'client_phone', label:'Téléphone',       ph:'+32 4XX XX XX XX'    },
            { k:'vehicle',      label:'Véhicule',        ph:'BMW M4 · 1-ABC-234'  },
            { k:'notes',        label:'Notes internes',  ph:'Infos complémentaires…' },
          ].map(({ k, label, ph }, i, arr) => (
            <div key={k}>
              <div style={{ padding:'14px 18px' }}>
                <div style={{ color:C.tertiary, fontSize:12, marginBottom:6 }}>{label}</div>
                <input value={form[k]} onChange={setF(k)} placeholder={ph} style={inputStyle} />
              </div>
              {i < arr.length-1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
            </div>
          ))}
        </div>

        {/* Récap */}
        {form.service_id && form.date && form.time && (
          <div style={{ background:'#EBF5FF', borderRadius:R.xl, padding:'16px 18px', border:'1px solid rgba(0,122,255,0.2)' }}>
            <div style={{ color:C.blue, fontSize:13, fontWeight:700, marginBottom:8 }}>Récapitulatif</div>
            {[
              ['Service', services.find(s=>s.id===form.service_id)?.name],
              ['Date', new Date(form.date+'T00:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'})],
              ['Heure', form.time],
              ['Prix', `${services.find(s=>s.id===form.service_id)?.price || 0} €`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
                <span style={{ color:C.secondary, fontSize:13 }}>{k}</span>
                <span style={{ color:C.primary, fontSize:13, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleCreate} disabled={saving || !form.service_id || !form.date || !form.time}
          style={{ width:'100%', background:(!form.service_id||!form.date||!form.time) ? C.fill : C.primary, border:'none', borderRadius:R.xl, padding:'17px', color:(!form.service_id||!form.date||!form.time) ? C.quaternary : '#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, opacity:saving?0.7:1 }}>
          {saving ? 'Création…' : 'Confirmer le rendez-vous ✓'}
        </button>
      </div>
    </div>
  )

  // ── Vue Agenda ──
  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>
      <div style={{ padding:'8px 20px 16px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 12px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Accueil
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:0, letterSpacing:-0.8 }}>Agenda</h1>
            <p style={{ color:C.secondary, fontSize:14, margin:'3px 0 0' }}>{bookings.length} RDV cette semaine</p>
          </div>
          <button onClick={() => openNew(todayISO)} style={{ background:C.primary, border:'none', borderRadius:R.lg, padding:'11px 18px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm }}>
            + RDV
          </button>
        </div>
      </div>

      {savedMsg && (
        <div style={{ margin:'0 20px 14px', background:'#F0FFF4', borderRadius:R.lg, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(52,199,89,0.25)' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ color:C.green, fontSize:14, fontWeight:600 }}>RDV créé avec succès</span>
        </div>
      )}

      {/* Navigation semaine */}
      <div style={{ padding:'0 20px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => setWeekOffset(w => w-1)} style={{ width:38, height:38, borderRadius:R.full, background:C.card, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:SHADOW.sm }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ flex:1, textAlign:'center' }}>
          <span style={{ color:C.primary, fontSize:14, fontWeight:700 }}>
            {weekDates[0].getDate()} {MON_FR[weekDates[0].getMonth()]} – {weekDates[6].getDate()} {MON_FR[weekDates[6].getMonth()]} {weekDates[0].getFullYear()}
          </span>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{ marginLeft:10, background:C.fill, border:'none', borderRadius:R.full, padding:'3px 10px', color:C.blue, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
              Aujourd'hui
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w+1)} style={{ width:38, height:38, borderRadius:R.full, background:C.card, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:SHADOW.sm }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Grille des 7 jours */}
      <div style={{ padding:'0 12px 20px', display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
        {weekDates.map(d => {
          const iso   = d.toISOString().split('T')[0]
          const isToday = iso === todayISO
          const dayBk = bookings.filter(b => b.scheduled_date === iso)
          const sel   = selectedDay === iso
          return (
            <button key={iso} onClick={() => setSelectedDay(sel ? null : iso)} style={{ background: isToday ? C.primary : sel ? C.fill : C.card, borderRadius:R.lg, padding:'10px 4px', border:'none', cursor:'pointer', boxShadow: isToday ? SHADOW.md : SHADOW.xs, transition:'all 0.15s' }}>
              <div style={{ color: isToday ? 'rgba(255,255,255,0.6)' : C.tertiary, fontSize:10, fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{DOW_FR[d.getDay()]}</div>
              <div style={{ color: isToday ? '#fff' : C.primary, fontSize:18, fontWeight:800, lineHeight:1 }}>{d.getDate()}</div>
              {dayBk.length > 0 ? (
                <div style={{ marginTop:6, display:'flex', justifyContent:'center' }}>
                  <div style={{ background: isToday ? 'rgba(255,255,255,0.8)' : C.blue, borderRadius:R.full, padding:'2px 7px', minWidth:20 }}>
                    <span style={{ color: isToday ? C.primary : '#fff', fontSize:11, fontWeight:700 }}>{dayBk.length}</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop:6, height:18 }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Détail du jour sélectionné ou liste du jour */}
      {loading ? <Spinner /> : (() => {
        const dayToShow  = selectedDay || todayISO
        const dayLabel   = new Date(dayToShow+'T00:00').toLocaleDateString('fr-BE', { weekday:'long', day:'numeric', month:'long' })
        const dayBookings = bookings.filter(b => b.scheduled_date === dayToShow)
        return (
          <div style={{ padding:'0 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ color:C.primary, fontSize:16, fontWeight:700, textTransform:'capitalize' }}>{dayLabel}</span>
              <button onClick={() => openNew(dayToShow)} style={{ background:C.fill2, border:'none', borderRadius:R.lg, padding:'7px 14px', color:C.primary, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
                + Ajouter
              </button>
            </div>
            {dayBookings.length === 0 ? (
              <div style={{ background:C.card, borderRadius:R.xl, padding:'28px', textAlign:'center', boxShadow:SHADOW.sm }}>
                <div style={{ color:C.tertiary, fontSize:15 }}>Aucun RDV ce jour</div>
                <button onClick={() => openNew(dayToShow)} style={{ marginTop:12, background:C.primary, border:'none', borderRadius:R.lg, padding:'10px 22px', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
                  + Créer un RDV
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {dayBookings.sort((a,b) => a.scheduled_time?.localeCompare(b.scheduled_time)).map(b => {
                  const mins = b.services?.duration_minutes
                  const dur  = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60?String(mins%60).padStart(2,'0'):''}` : `${mins}min`
                  const cfg  = { pending:{color:C.orange,label:'En attente'}, confirmed:{color:C.blue,label:'Confirmé'}, in_progress:{color:C.indigo,label:'En cours'}, completed:{color:C.green,label:'Terminé'} }[b.status] || {color:C.quaternary,label:b.status}
                  const isManual = b.notes?.startsWith('[Manuel]')
                  return (
                    <div key={b.id} style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm, display:'flex' }}>
                      <div style={{ width:4, background:cfg.color, flexShrink:0 }} />
                      <div style={{ flex:1, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                            <span style={{ color:C.primary, fontSize:16, fontWeight:800 }}>{b.scheduled_time?.slice(0,5)}</span>
                            {isManual && <span style={{ background:C.fill2, borderRadius:R.full, padding:'2px 8px', color:C.tertiary, fontSize:11, fontWeight:600 }}>Manuel</span>}
                          </div>
                          <div style={{ color:C.secondary, fontSize:13 }}>{b.profiles?.full_name || (isManual ? b.notes?.match(/Client : ([^·]+)/)?.[1]?.trim() : 'Client')} · {dur}</div>
                          <div style={{ color:C.tertiary, fontSize:12, marginTop:2 }}>{b.services?.name}</div>
                          {b.vehicle && b.vehicle !== 'Non précisé' && <div style={{ color:C.tertiary, fontSize:12 }}>🚗 {b.vehicle}</div>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ background:`${cfg.color}18`, borderRadius:R.full, padding:'3px 10px', marginBottom:6 }}>
                            <span style={{ color:cfg.color, fontSize:11, fontWeight:700 }}>{cfg.label}</span>
                          </div>
                          <div style={{ color:C.primary, fontSize:15, fontWeight:800 }}>{b.total_price}€</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

// ─── PRO ADMIN ────────────────────────────────────────────────────────────────
function ProAdmin({ profile, detailer, onLogout, onDetailerUpdate, onProfileUpdate, onBack }) {
  const [tab,     setTab]     = useState('profil')
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [creating, setCreating] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError,   setConnectError]   = useState(null)
  const [proStats,     setProStats]     = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'stats' || !detailer || proStats) return
    fetchProStats()
  }, [tab, detailer])

  const fetchProStats = async () => {
    setStatsLoading(true)
    const now        = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`

    const [
      { data: monthCompleted },
      { data: monthAll },
      { data: allCompleted },
      { data: svcRows },
      { data: last5 },
    ] = await Promise.all([
      supabase.from('bookings').select('total_price').eq('detailer_id', detailer.id).eq('status', 'completed').gte('scheduled_date', monthStart),
      supabase.from('bookings').select('client_id, status').eq('detailer_id', detailer.id).neq('status', 'cancelled').gte('scheduled_date', monthStart),
      supabase.from('bookings').select('total_price').eq('detailer_id', detailer.id).eq('status', 'completed'),
      supabase.from('bookings').select('services(name)').eq('detailer_id', detailer.id).eq('status', 'completed').not('service_id', 'is', null),
      supabase.from('bookings').select('total_price, scheduled_date, status, services(name)').eq('detailer_id', detailer.id).neq('status', 'cancelled').order('scheduled_date', { ascending: false }).limit(5),
    ])

    const caMonth      = (monthCompleted || []).reduce((s, b) => s + Number(b.total_price), 0)
    const rdvMonth     = (monthAll || []).length
    const clientsMonth = new Set((monthAll || []).map(b => b.client_id)).size
    const caTotal      = (allCompleted || []).reduce((s, b) => s + Number(b.total_price), 0)
    const rdvTotal     = (allCompleted || []).length

    const svcCount = {}
    ;(svcRows || []).forEach(b => {
      const name = b.services?.name
      if (name) svcCount[name] = (svcCount[name] || 0) + 1
    })
    const topSvc = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

    setProStats({ caMonth, rdvMonth, clientsMonth, caTotal, rdvTotal, topSvc, last5: last5 || [] })
    setStatsLoading(false)
  }

  const [form, setForm] = useState({
    full_name:     profile?.full_name     || '',
    phone_perso:   profile?.phone         || '',
    business_name: detailer?.business_name || '',
    description:   detailer?.description  || '',
    address:       detailer?.address      || '',
    city:          detailer?.city         || '',
    postal_code:   detailer?.postal_code  || '',
    country_code:  detailer?.country_code || 'BE',
    phone:         detailer?.phone        || '',
    website:       detailer?.website      || '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone_perso }).eq('id', profile.id)

    onProfileUpdate?.({ full_name: form.full_name, phone: form.phone_perso })

    if (detailer) {
      const { data: updated } = await supabase.from('detailers').update({
        business_name: form.business_name,
        description:   form.description,
        address:       form.address,
        city:          form.city,
        postal_code:   form.postal_code,
        country_code:  form.country_code,
        phone:         form.phone,
        website:       form.website,
      }).eq('id', detailer.id).select().single()
      if (updated) onDetailerUpdate(updated)
    } else if (creating) {
      let lat = 50.8503, lng = 4.3517
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }))
        lat = pos.coords.latitude; lng = pos.coords.longitude
      } catch {}
      const { data: created } = await supabase.from('detailers').insert({
        profile_id:    profile.id,
        business_name: form.business_name || 'Mon entreprise',
        description:   form.description,
        address:       form.address || 'À compléter',
        city:          form.city    || 'À compléter',
        postal_code:   form.postal_code,
        country_code:  form.country_code,
        phone:         form.phone,
        website:       form.website,
        lat, lng,
      }).select().single()
      if (created) {
        onDetailerUpdate(created)
        setCreating(false)
        setSaving(false)
        onBack()
        return
      }
    }

    setSaving(false); setEditing(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Stripe Connect onboarding ────────────────────────────────────────────────
  const handleConnectStripe = async () => {
    setConnectLoading(true)
    setConnectError(null)
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: {
          detailer_id:   detailer.id,
          email:         profile.email,
          business_name: detailer.business_name,
          country:       detailer.country_code || 'BE',
          return_url:  `${window.location.origin}?stripe_connect_return=true`,
          refresh_url: `${window.location.origin}?stripe_connect_refresh=true`,
        },
      })
      if (error) {
        // Extract the real error body from the edge function response
        let msg = error.message
        try {
          const body = await error.context?.json?.()
          if (body?.error) msg = body.error
        } catch (_) {}
        throw new Error(msg)
      }
      if (data?.error) throw new Error(data.error)
      if (data.account_id) {
        sessionStorage.setItem('detailpro_connect_pending', JSON.stringify({
          account_id:  data.account_id,
          detailer_id: detailer.id,
        }))
      }
      window.location.href = data.url
    } catch (e) {
      setConnectError(e.message || 'Erreur lors de la connexion à Stripe')
      setConnectLoading(false)
    }
  }

  const inputStyle = {
    width:'100%', background:C.fill2, border:`1.5px solid ${C.separator}`,
    borderRadius:R.sm, padding:'9px 12px', fontSize:15, color:C.primary,
    fontFamily:FONT, outline:'none', boxSizing:'border-box',
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : '?'

  return (
    <div style={{ paddingBottom:24, fontFamily:FONT }}>

      {/* Header */}
      <div style={{ padding:'8px 20px 16px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:C.blue, fontSize:15, fontFamily:FONT, padding:'0 0 12px', fontWeight:600 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Accueil
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ color:C.primary, fontSize:30, fontWeight:800, margin:0, letterSpacing:-0.8 }}>Mon Profil</h1>
        <button
          onClick={() => { setEditing(e => { if (e) setCreating(false); return !e }); setSaved(false) }}
          style={{ background: editing ? C.fill : C.primary, border:'none', borderRadius:R.lg, padding:'9px 20px', color: editing ? C.primary : '#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT }}
        >
          {editing ? 'Annuler' : 'Modifier'}
        </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 20px 20px' }}>
        <PillTabs tabs={['Mon Profil','Statistiques']} active={tab === 'profil' ? 'Mon Profil' : 'Statistiques'} onChange={l => setTab(l === 'Mon Profil' ? 'profil' : 'stats')} />
      </div>

      {/* ── TAB PROFIL ── */}
      {tab === 'profil' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Avatar */}
          <div style={{ background:C.card, borderRadius:R.xxl, padding:'22px', boxShadow:SHADOW.md, display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:64, height:64, borderRadius:R.full, background:'linear-gradient(145deg,#1C1C1E,#3a3a50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff', fontWeight:800, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:C.primary, fontSize:20, fontWeight:800, letterSpacing:-0.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{form.full_name || 'Nettoyeur Pro'}</div>
              <div style={{ color:C.secondary, fontSize:14, marginTop:3 }}>{profile?.email}</div>
              <div style={{ marginTop:8 }}>
                <span style={{ background: detailer?.verified ? '#E8FFF1' : C.fill2, borderRadius:R.full, padding:'4px 12px', color: detailer?.verified ? C.green : C.tertiary, fontSize:12, fontWeight:700 }}>
                  {detailer?.verified ? '✓ Vérifié' : detailer ? 'Non vérifié' : 'Profil incomplet'}
                </span>
              </div>
            </div>
          </div>

          {/* No detailer yet */}
          {!detailer && !creating && (
            <div style={{ background:'#FFF8E8', borderRadius:R.xl, padding:'20px', border:'1px solid rgba(255,149,0,0.25)' }}>
              <div style={{ color:'#CC7A00', fontSize:15, fontWeight:700, marginBottom:6 }}>⚠ Profil nettoyeur non créé</div>
              <div style={{ color:'#996600', fontSize:13, lineHeight:1.5, marginBottom:14 }}>
                Créez votre profil pro pour apparaître dans les recherches et recevoir des réservations.
              </div>
              <button onClick={() => { setCreating(true); setEditing(true) }} style={{ background:C.orange, border:'none', borderRadius:R.lg, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
                Créer mon profil nettoyeur
              </button>
            </div>
          )}

          {/* Section compte */}
          <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
            <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
              <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Informations personnelles</span>
            </div>
            {[
              { k:'full_name',   label:'Nom complet', ph:'Jean Dupont'        },
              { k:'phone_perso', label:'Téléphone',   ph:'+32 4XX XX XX XX'   },
            ].map(({ k, label, ph }, i, arr) => (
              <div key={k}>
                <div style={{ padding:'14px 18px' }}>
                  <div style={{ color:C.tertiary, fontSize:12, marginBottom:4 }}>{label}</div>
                  {editing
                    ? <input value={form[k]} onChange={set(k)} placeholder={ph} style={inputStyle} />
                    : <div style={{ color: form[k] ? C.primary : C.quaternary, fontSize:15 }}>{form[k] || ph}</div>}
                </div>
                {i < arr.length-1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
              </div>
            ))}
          </div>

          {/* Section entreprise */}
          {(detailer || creating) && (
            <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
              <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
                <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Mon entreprise</span>
              </div>
              {[
                { k:'business_name', label:'Nom de l\'entreprise', ph:'Mon Garage Pro'                  },
                { k:'description',   label:'Description',          ph:'Spécialiste du detailing...'     },
                { k:'address',       label:'Adresse',              ph:'Rue de la Paix 1'                },
                { k:'city',          label:'Ville',                ph:'Bruxelles'                       },
                { k:'postal_code',   label:'Code postal',          ph:'1000'                            },
                { k:'phone',         label:'Téléphone pro',        ph:'+32 2 XXX XX XX'                 },
                { k:'website',       label:'Site web',             ph:'https://monsite.be'              },
              ].map(({ k, label, ph }, i, arr) => (
                <div key={k}>
                  <div style={{ padding:'14px 18px' }}>
                    <div style={{ color:C.tertiary, fontSize:12, marginBottom:4 }}>{label}</div>
                    {editing
                      ? <input value={form[k]} onChange={set(k)} placeholder={ph} style={inputStyle} />
                      : <div style={{ color: form[k] ? C.primary : C.quaternary, fontSize:15 }}>{form[k] || ph}</div>}
                  </div>
                  {i < arr.length-1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
                </div>
              ))}
              {/* Pays */}
              <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />
              <div style={{ padding:'14px 18px' }}>
                <div style={{ color:C.tertiary, fontSize:12, marginBottom:4 }}>Pays</div>
                {editing ? (
                  <select value={form.country_code} onChange={set('country_code')} style={{ ...inputStyle, appearance:'none' }}>
                    {[['BE','🇧🇪 Belgique'],['FR','🇫🇷 France'],['NL','🇳🇱 Pays-Bas'],['LU','🇱🇺 Luxembourg'],['DE','🇩🇪 Allemagne']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ color:C.primary, fontSize:15 }}>
                    {{'BE':'🇧🇪 Belgique','FR':'🇫🇷 France','NL':'🇳🇱 Pays-Bas','LU':'🇱🇺 Luxembourg','DE':'🇩🇪 Allemagne'}[form.country_code] || form.country_code}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Stripe Connect : paiements en ligne ── */}
          {detailer && (
            <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
              <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
                <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Paiements en ligne</span>
              </div>
              <div style={{ padding:'18px' }}>
                {detailer.stripe_account_id ? (
                  /* ─ Compte connecté (onboarding fait ou en cours) ─ */
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ color:C.green, fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Paiements activés
                      </div>
                      <div style={{ color:C.secondary, fontSize:13, marginTop:4 }}>Les clients peuvent vous payer directement en ligne</div>
                    </div>
                    <button onClick={handleConnectStripe} disabled={connectLoading} style={{ background:C.fill2, border:'none', borderRadius:R.md, padding:'8px 14px', color:C.secondary, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
                      {connectLoading ? '…' : 'Gérer'}
                    </button>
                  </div>
                ) : (
                  /* ─ Pas encore connecté ─ */
                  <div>
                    <div style={{ color:C.primary, fontSize:15, fontWeight:700, marginBottom:6 }}>Acceptez les paiements en ligne</div>
                    <div style={{ color:C.secondary, fontSize:13, marginBottom:14, lineHeight:1.5 }}>
                      Connectez un compte Stripe pour recevoir les paiements directement sur votre compte bancaire — en Belgique et à l'international.
                    </div>
                    <button onClick={handleConnectStripe} disabled={connectLoading} style={{ width:'100%', background:C.primary, border:'none', borderRadius:R.lg, padding:'13px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, opacity:connectLoading?0.7:1 }}>
                      {connectLoading ? 'Chargement…' : '💳 Activer les paiements en ligne →'}
                    </button>
                  </div>
                )}
                {connectError && <p style={{ color:C.red, fontSize:13, margin:'12px 0 0' }}>⚠ {connectError}</p>}
              </div>
            </div>
          )}

          {/* Note & avis (readonly) */}
          {detailer && (
            <div style={{ background:C.card, borderRadius:R.xl, padding:'18px', boxShadow:SHADOW.sm, display:'flex', justifyContent:'space-around', textAlign:'center' }}>
              <div>
                <div style={{ color:C.primary, fontSize:28, fontWeight:900, letterSpacing:-0.5 }}>{detailer.rating?.toFixed(1) || '—'}</div>
                <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginTop:3 }}>Note moyenne</div>
              </div>
              <div style={{ width:0.5, background:C.separator }} />
              <div>
                <div style={{ color:C.primary, fontSize:28, fontWeight:900 }}>{detailer.review_count || 0}</div>
                <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginTop:3 }}>Avis clients</div>
              </div>
              <div style={{ width:0.5, background:C.separator }} />
              <div>
                <div style={{ color: detailer.active ? C.green : C.red, fontSize:14, fontWeight:800, marginTop:4 }}>{detailer.active ? 'Actif' : 'Inactif'}</div>
                <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginTop:3 }}>Statut</div>
              </div>
            </div>
          )}

          {/* Enregistrer */}
          {editing && (
            <button onClick={handleSave} disabled={saving} style={{ width:'100%', background:C.primary, border:'none', borderRadius:R.xl, padding:'17px', color:'#fff', fontSize:16, fontWeight:700, cursor: saving ? 'wait' : 'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Enregistrement…' : (creating ? 'Créer mon profil ✓' : 'Enregistrer les modifications')}
            </button>
          )}

          {saved && (
            <div style={{ background:'#F0FFF4', borderRadius:R.lg, padding:'14px 18px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(52,199,89,0.25)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color:C.green, fontSize:14, fontWeight:600 }}>Profil mis à jour avec succès</span>
            </div>
          )}

          {/* Déconnexion */}
          <button onClick={onLogout} style={{ width:'100%', background:C.card, border:'none', borderRadius:R.xl, padding:'17px', color:C.red, fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.sm, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      )}

      {/* ── TAB STATS ── */}
      {tab === 'stats' && (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {!detailer ? (
            <EmptyState icon="📊" title="Profil requis" subtitle="Créez votre profil nettoyeur pour accéder aux statistiques." />
          ) : statsLoading || !proStats ? (
            <Spinner />
          ) : (
            <>
              {/* CA ce mois */}
              <div style={{ background:C.primary, borderRadius:R.xxl, padding:'26px' }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.7, margin:'0 0 4px' }}>
                  Chiffre d'affaires — {new Date().toLocaleDateString('fr-BE',{month:'long',year:'numeric'})}
                </p>
                <div style={{ color:'#fff', fontSize:46, fontWeight:900, lineHeight:1, letterSpacing:-1 }}>
                  {Math.round(proStats.caMonth).toLocaleString('fr-BE')}<span style={{ fontSize:22, fontWeight:500 }}> €</span>
                </div>
                <div style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginTop:10, display:'flex', gap:20 }}>
                  <span>🗓 {proStats.rdvMonth} RDV</span>
                  <span>👤 {proStats.clientsMonth} client{proStats.clientsMonth !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Chiffres globaux */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'CA total', value:`${Math.round(proStats.caTotal).toLocaleString('fr-BE')} €`, icon:'💰', color:C.green },
                  { label:'RDV total terminés', value:proStats.rdvTotal, icon:'✅', color:C.blue },
                  { label:'Note moyenne', value:`${detailer.rating?.toFixed(1) || '—'} ★`, icon:'⭐', color:C.orange },
                  { label:'Avis clients', value:detailer.review_count || 0, icon:'💬', color:C.indigo },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{ background:C.card, borderRadius:R.xl, padding:'18px', boxShadow:SHADOW.sm }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                    <div style={{ color, fontSize:20, fontWeight:900, letterSpacing:-0.5 }}>{value}</div>
                    <div style={{ color:C.tertiary, fontSize:12, fontWeight:600, marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Top services */}
              {proStats.topSvc.length > 0 && (
                <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
                  <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
                    <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Top services</span>
                  </div>
                  {proStats.topSvc.map(([name, count], i) => {
                    const pct = Math.round(count / proStats.rdvTotal * 100)
                    return (
                      <div key={name}>
                        <div style={{ padding:'14px 18px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                            <span style={{ color:C.primary, fontSize:14, fontWeight:600 }}>{name}</span>
                            <span style={{ color:C.secondary, fontSize:13 }}>{count} RDV · {pct}%</span>
                          </div>
                          <div style={{ height:6, background:C.fill2, borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${proStats.rdvTotal > 0 ? pct : 0}%`, background:svcGrad(name), borderRadius:3, transition:'width 0.6s ease' }} />
                          </div>
                        </div>
                        {i < proStats.topSvc.length - 1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Dernières réservations */}
              {proStats.last5.length > 0 && (
                <div style={{ background:C.card, borderRadius:R.xl, overflow:'hidden', boxShadow:SHADOW.sm }}>
                  <div style={{ padding:'13px 18px', borderBottom:`0.5px solid ${C.separator}` }}>
                    <span style={{ color:C.tertiary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7 }}>Dernières réservations</span>
                  </div>
                  {proStats.last5.map((b, i, arr) => {
                    const dateStr = new Date(b.scheduled_date+'T00:00').toLocaleDateString('fr-BE',{day:'numeric',month:'short'})
                    const statusColor = { completed:C.green, confirmed:C.blue, pending:C.orange, in_progress:C.indigo }[b.status] || C.tertiary
                    return (
                      <div key={b.id || i}>
                        <div style={{ padding:'13px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <div style={{ color:C.primary, fontSize:14, fontWeight:600 }}>{b.services?.name || 'Service'}</div>
                            <div style={{ color:C.tertiary, fontSize:12, marginTop:2 }}>{dateStr}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ color:C.primary, fontSize:15, fontWeight:700 }}>{Number(b.total_price).toLocaleString('fr-BE')} €</div>
                            <div style={{ color:statusColor, fontSize:11, fontWeight:600, marginTop:2 }}>
                              { {completed:'Terminé',confirmed:'Confirmé',pending:'En attente',in_progress:'En cours'}[b.status] || b.status }
                            </div>
                          </div>
                        </div>
                        {i < arr.length - 1 && <div style={{ height:0.5, background:C.separator, marginLeft:18 }} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Rafraîchir */}
              <button onClick={() => { setProStats(null) }} style={{ background:C.fill2, border:'none', borderRadius:R.lg, padding:'12px', color:C.secondary, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
                ↻ Actualiser les données
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session,      setSession]      = useState(null)
  const [profile,      setProfile]      = useState(null)
  const [detailer,     setDetailer]     = useState(null)
  const [appLoading,   setAppLoading]   = useState(true)
  const [roleChoice,   setRoleChoice]   = useState(null)
  const [stripeReturn, setStripeReturn] = useState(null) // null | 'processing' | 'success' | 'error'
  const [initialTab,   setInitialTab]   = useState(null) // force une tab au démarrage

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setAppLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setDetailer(null); setAppLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (uid) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const email    = user?.email    || ''
      const meta     = user?.user_metadata || {}

      // 1. Essaie de charger le profil existant
      let { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

      // 2. Profil introuvable (trigger n'a pas tourné ou schema pas encore appliqué)
      //    → on le crée manuellement depuis les métadonnées auth
      if (!prof && error?.code === 'PGRST116') {
        const role = meta.role || 'client'
        const { data: created } = await supabase
          .from('profiles')
          .insert({ id: uid, role, full_name: meta.full_name || '' })
          .select()
          .single()
        prof = created
      }

      if (prof) {
        setProfile({ ...prof, email })

        // Déclarer params ici pour usage dans les deux blocs ci-dessous
        const params = new URLSearchParams(window.location.search)

        if (prof.role === 'detailer') {
          const { data: det } = await supabase
            .from('detailers')
            .select('*')
            .eq('profile_id', uid)
            .single()

          let detailerData = det || null

          // ── Retour depuis Stripe Connect onboarding ───────────────────────
          const connectReturn  = params.get('stripe_connect_return')
          const connectRefresh = params.get('stripe_connect_refresh')

          if ((connectReturn === 'true' || connectRefresh === 'true') && detailerData) {
            window.history.replaceState({}, '', window.location.pathname)

            // Récupérer l'account_id sauvegardé en sessionStorage avant le redirect
            let accountId = detailerData.stripe_account_id
            try {
              const raw = sessionStorage.getItem('detailpro_connect_pending')
              if (raw) {
                const pending = JSON.parse(raw)
                if (pending.detailer_id === detailerData.id && pending.account_id) {
                  accountId = pending.account_id
                }
                sessionStorage.removeItem('detailpro_connect_pending')
              }
            } catch {}

            // Sauvegarder en DB si on a un account_id
            if (accountId) {
              await supabase
                .from('detailers')
                .update({ stripe_account_id: accountId })
                .eq('id', detailerData.id)
              detailerData = { ...detailerData, stripe_account_id: accountId }
            }
          }

          setDetailer(detailerData)
        }

        // ── Retour depuis redirect Stripe (Bancontact, iDEAL, 3DS…) ───────────
        // (params déjà déclaré ci-dessus)
        const piId         = params.get('payment_intent')
        const redirectStatus = params.get('redirect_status')
        const pendingRaw   = sessionStorage.getItem('detailpro_pending_booking')

        if (piId && pendingRaw) {
          // Nettoyer l'URL sans recharger la page
          window.history.replaceState({}, '', window.location.pathname)

          if (redirectStatus === 'succeeded') {
            setStripeReturn('processing')
            try {
              const booking = JSON.parse(pendingRaw)
              const { error: dbError } = await supabase.from('bookings').insert({
                ...booking,
                status:                   'pending',
                payment_status:           'paid',
                stripe_payment_intent_id: piId,
              })
              sessionStorage.removeItem('detailpro_pending_booking')
              if (!dbError) setInitialTab('bookings')
              setStripeReturn(dbError ? 'error' : 'success')
            } catch {
              setStripeReturn('error')
            }
          } else {
            // Paiement annulé ou échoué
            sessionStorage.removeItem('detailpro_pending_booking')
            setStripeReturn('error')
          }
        }
      } else {
        // Table profiles absente (schema pas encore exécuté)
        // On crée un profil local minimal pour ne pas rester bloqué
        setProfile({ id: uid, email, role: meta.role === 'detailer' ? 'detailer' : 'client', full_name: meta.full_name || '', _schemaError: true })
      }
    } catch (e) {
      console.error('loadProfile:', e)
    }
    setAppLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setRoleChoice(null)
  }

  if (appLoading) return <LoadingScreen />

  // Not logged in
  if (!session) {
    if (!roleChoice) return <RoleScreen onSelect={setRoleChoice} />
    return <AuthScreen role={roleChoice} onBack={() => setRoleChoice(null)} />
  }

  if (!profile) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px', gap:20, textAlign:'center' }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <h2 style={{ color:C.primary, fontSize:22, fontWeight:800, margin:0 }}>Profil introuvable</h2>
      <p style={{ color:C.secondary, fontSize:15, margin:0, lineHeight:1.6 }}>
        Votre compte existe mais le profil n'a pas été créé.<br/>
        Exécutez le fichier <strong>schema.sql</strong> dans Supabase puis reconnectez-vous.
      </p>
      <button onClick={logout} style={{ background:C.primary, border:'none', borderRadius:R.xl, padding:'14px 32px', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>
        Se déconnecter
      </button>
    </div>
  )

  // Alerte si schema non appliqué mais profil local créé
  if (profile._schemaError) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px', gap:20, textAlign:'center' }}>
      <div style={{ fontSize:48 }}>🗄️</div>
      <h2 style={{ color:C.primary, fontSize:22, fontWeight:800, margin:0 }}>Base de données non configurée</h2>
      <p style={{ color:C.secondary, fontSize:15, margin:0, lineHeight:1.6 }}>
        Copiez le contenu de <strong>schema.sql</strong> dans<br/>
        <strong>Supabase → SQL Editor</strong> et cliquez <strong>Run</strong>.
      </p>
      <div style={{ background:C.card, borderRadius:R.lg, padding:'16px 20px', width:'100%', textAlign:'left', boxShadow:SHADOW.sm }}>
        <p style={{ color:C.tertiary, fontSize:12, fontWeight:600, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:0.5 }}>Étapes</p>
        {['Ouvrez supabase.com → votre projet','SQL Editor → New query','Collez schema.sql → cliquez Run','Revenez ici et reconnectez-vous'].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0' }}>
            <div style={{ width:22, height:22, borderRadius:11, background:C.fill, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:C.primary, fontSize:11, fontWeight:700 }}>{i+1}</span>
            </div>
            <span style={{ color:C.secondary, fontSize:14 }}>{s}</span>
          </div>
        ))}
      </div>
      <button onClick={logout} style={{ background:C.card, border:`1px solid ${C.separator}`, borderRadius:R.xl, padding:'13px 28px', color:C.red, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:FONT }}>
        Se déconnecter
      </button>
    </div>
  )

  // ── Écran de retour Stripe (après redirect Bancontact / 3DS / iDEAL…) ──────
  if (stripeReturn === 'processing') return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:'40px 28px' }}>
      <div style={{ width:56, height:56, borderRadius:28, border:`3px solid ${C.fill}`, borderTop:`3px solid ${C.blue}`, animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.secondary, fontSize:16, margin:0 }}>Finalisation de votre réservation…</p>
    </div>
  )

  if (stripeReturn === 'success') return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:'40px 28px', textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:R.full, background:C.green, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 12px 32px rgba(52,199,89,0.35)' }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <h2 style={{ color:C.primary, fontSize:26, fontWeight:800, margin:'0 0 8px', letterSpacing:-0.5 }}>Réservation confirmée !</h2>
        <p style={{ color:C.secondary, fontSize:15, margin:0, lineHeight:1.5 }}>
          Votre paiement a bien été reçu.<br/>Retrouvez votre RDV dans "Mes RDV".
        </p>
      </div>
      <button
        onClick={() => { setInitialTab('bookings'); setStripeReturn(null) }}
        style={{ background:C.primary, border:'none', borderRadius:R.xl, padding:'16px 36px', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.lg }}
      >
        Voir mes RDV →
      </button>
    </div>
  )

  if (stripeReturn === 'error') return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:'40px 28px', textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:R.full, background:'#FFF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>❌</div>
      <div>
        <h2 style={{ color:C.primary, fontSize:24, fontWeight:800, margin:'0 0 8px' }}>Paiement non abouti</h2>
        <p style={{ color:C.secondary, fontSize:15, margin:0, lineHeight:1.5 }}>
          Votre paiement a été annulé ou a échoué.<br/>Aucun montant n'a été débité.
        </p>
      </div>
      <button
        onClick={() => setStripeReturn(null)}
        style={{ background:C.primary, border:'none', borderRadius:R.xl, padding:'16px 36px', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:SHADOW.lg }}
      >
        Réessayer
      </button>
    </div>
  )

  const updateProfile = (updates) => setProfile(p => ({ ...p, ...updates }))

  if (profile.role === 'client')   return <ClientShell  profile={profile} onLogout={logout} onProfileUpdate={updateProfile} initialTab={initialTab} />
  if (profile.role === 'detailer') return <ProShell     profile={profile} detailer={detailer} onLogout={logout} onProfileUpdate={updateProfile} />
  return <RoleScreen onSelect={setRoleChoice} />
}

// ─── CLIENT SHELL ─────────────────────────────────────────────────────────────
function ClientShell({ profile, onLogout, onProfileUpdate, initialTab }) {
  const [screen,   setScreen]   = useState(initialTab || 'home')
  const [detailer, setDetailer] = useState(null)

  const goDetailer = (d) => { setDetailer(d); setScreen('detailer') }
  const goBooked   = ()  => setScreen('bookings')
  const goExplore  = ()  => setScreen('explore')

  // Detailer screen takes full viewport (has its own back button)
  if (screen === 'detailer') return (
    <div style={{ height:'100%', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        <DetailerScreen detailer={detailer} profile={profile} onBack={() => setScreen('explore')} onBooked={goBooked} />
      </div>
    </div>
  )

  return (
    <div style={{ height:'100%', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <StatusBar />
      <div style={{ flex:1, overflowY:'auto' }}>
        {screen === 'home'     && <ClientHome     profile={profile} onExplore={goExplore} onProfile={() => setScreen('profile')} />}
        {screen === 'explore'  && <NearbyScreen   onSelectDetailer={goDetailer} onBack={() => setScreen('home')} />}
        {screen === 'bookings' && <BookingsScreen profile={profile} onBack={() => setScreen('home')} />}
        {screen === 'profile'  && <ClientProfile  profile={profile} onLogout={onLogout} onBack={() => setScreen('home')} onProfileUpdate={onProfileUpdate} />}
      </div>
      <NavBar tabs={CLIENT_TABS} active={screen} onChange={setScreen} accentColor={C.blue} />
    </div>
  )
}

// ─── PRO SHELL ────────────────────────────────────────────────────────────────
function ProShell({ profile: initialProfile, detailer: initialDetailer, onLogout, onProfileUpdate }) {
  const [screen,   setScreen]   = useState('home')
  const [detailer, setDetailer] = useState(initialDetailer)
  const [profile,  setProfile]  = useState(initialProfile)

  const handleProfileUpdate = (updates) => {
    setProfile(p => ({ ...p, ...updates }))
    onProfileUpdate?.(updates)
  }

  return (
    <div style={{ height:'100%', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <StatusBar />
      <div style={{ flex:1, overflowY:'auto' }}>
        {screen === 'home'     && <ProHome     profile={profile} detailer={detailer} onNav={setScreen} />}
        {screen === 'services' && <ProServices detailer={detailer} onBack={() => setScreen('home')} />}
        {screen === 'booking'  && <ProBooking  detailer={detailer} profile={profile} onBack={() => setScreen('home')} />}
        {screen === 'tracking' && <ProTracking detailer={detailer} onBack={() => setScreen('home')} />}
        {screen === 'admin'    && <ProAdmin    profile={profile} detailer={detailer} onLogout={onLogout} onDetailerUpdate={setDetailer} onProfileUpdate={handleProfileUpdate} onBack={() => setScreen('home')} />}
      </div>
      <NavBar tabs={PRO_TABS} active={screen} onChange={setScreen} />
    </div>
  )
}
