import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, SHADOW, R, FONT, Spinner, SectionHeader, svcGrad } from '../../components/Shared'

const STATUS_CFG = {
  pending:     { label: 'En attente', color: C.orange },
  confirmed:   { label: 'Confirmé',   color: C.blue   },
  in_progress: { label: 'En cours',   color: C.indigo },
  completed:   { label: 'Terminé',    color: C.green  },
  cancelled:   { label: 'Annulé',     color: C.red    },
}

export default function ProHome({ profile, detailer, onNav }) {
  const [bookings,   setBookings]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [stats,      setStats]      = useState({ today: 0, month: 0, pending: 0 })
  const [newBooking, setNewBooking] = useState(false)

  useEffect(() => {
    if (!detailer) { setLoading(false); return }
    fetchTodayBookings()
    computeStats()

    const channel = supabase
      .channel(`pro-home-${detailer.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `detailer_id=eq.${detailer.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setNewBooking(true)
        fetchTodayBookings()
        computeStats()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [detailer])

  const today = new Date().toISOString().split('T')[0]
  const month = new Date().toISOString().slice(0, 7)

  const fetchTodayBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, services(name, price, duration_minutes), profiles(full_name, phone)')
      .eq('detailer_id', detailer.id)
      .eq('scheduled_date', today)
      .neq('status', 'cancelled')
      .order('scheduled_time')
    setBookings(data || [])
    setLoading(false)
  }

  const computeStats = async () => {
    const [{ count: todayC }, { count: pendC }, { data: monthB }] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('detailer_id', detailer.id).eq('scheduled_date', today).neq('status', 'cancelled'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('detailer_id', detailer.id).eq('status', 'pending'),
      supabase.from('bookings').select('total_price').eq('detailer_id', detailer.id).gte('scheduled_date', `${month}-01`).eq('status', 'completed'),
    ])
    const monthRevenue = (monthB || []).reduce((s, b) => s + Number(b.total_price), 0)
    setStats({ today: todayC || 0, month: monthRevenue, pending: pendC || 0 })
  }

  const updateStatus = async (bookingId, status) => {
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    fetchTodayBookings()
    computeStats()
  }

  if (!detailer) return (
    <div style={{ padding: '52px 24px', textAlign: 'center', fontFamily: FONT }}>
      <div style={{ width: 64, height: 64, borderRadius: R.xxl, background: `${C.orange}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h2 style={{ color: C.primary, fontSize: 20, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.4 }}>Profil nettoyeur incomplet</h2>
      <p style={{ color: C.secondary, fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>Configurez votre profil pro pour commencer à recevoir des réservations.</p>
      <button onClick={() => onNav('admin')} style={{ background: C.primary, border: 'none', borderRadius: R.xl, padding: '15px 32px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.md }}>
        Configurer mon profil
      </button>
    </div>
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const initials = (profile?.full_name || detailer.business_name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ paddingBottom: 28, fontFamily: FONT }}>

      {/* Realtime new booking banner */}
      {newBooking && (
        <div
          onClick={() => { setNewBooking(false); onNav('tracking') }}
          style={{ margin: '10px 20px 0', background: `${C.green}14`, borderRadius: R.xl, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: `1px solid ${C.green}30` }}
        >
          <div style={{ width: 36, height: 36, borderRadius: R.full, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>Nouvelle réservation</div>
            <div style={{ color: C.secondary, fontSize: 12, marginTop: 2 }}>Appuyer pour voir les détails</div>
          </div>
          <button onClick={e => { e.stopPropagation(); setNewBooking(false) }} style={{ background: `${C.green}18`, border: 'none', borderRadius: R.full, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '12px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: C.tertiary, fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>{greeting}</p>
          <h1 style={{ color: C.primary, fontSize: 26, fontWeight: 800, margin: '0 0 2px', letterSpacing: -0.7 }}>{detailer.business_name}</h1>
          <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>
            {detailer.city} · {new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => onNav('admin')} style={{
          width: 44, height: 44, borderRadius: R.full,
          background: 'linear-gradient(145deg,#1D4ED8,#4338CA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: SHADOW.md, flexShrink: 0, border: 'none', cursor: 'pointer',
        }}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>{initials}</span>
        </button>
      </div>

      {/* Stats banner */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: C.primary, borderRadius: R.xxl, padding: '22px 24px',
          display: 'flex', gap: 0,
          boxShadow: SHADOW.lg,
        }}>
          <StatBlock value={stats.today} label="Auj." suffix="RDV" />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.10)', margin: '4px 18px' }} />
          <StatBlock value={`${Math.round(stats.month).toLocaleString('fr-BE')}`} label="CA mois" suffix="€" />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.10)', margin: '4px 18px' }} />
          <StatBlock value={stats.pending} label="En attente" highlight={stats.pending > 0} />
        </div>
      </div>

      {/* Today's bookings */}
      <div style={{ padding: '0 20px' }}>
        <SectionHeader
          title={`Aujourd'hui · ${bookings.length} RDV`}
          action="Voir tout"
          onAction={() => onNav('tracking')}
        />

        {loading ? <Spinner /> : bookings.length === 0 ? (
          <div style={{ background: C.card, borderRadius: R.xl, padding: '32px 24px', textAlign: 'center', boxShadow: SHADOW.sm, border: `1px solid ${C.separator}` }}>
            <div style={{ width: 48, height: 48, borderRadius: R.xl, background: C.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.tertiary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p style={{ color: C.primary, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Journée libre</p>
            <p style={{ color: C.tertiary, fontSize: 13, margin: 0 }}>Aucun rendez-vous planifié aujourd'hui</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map(b => (
              <ProBookingCard key={b.id} booking={b} onUpdate={updateStatus} />
            ))}
          </div>
        )}

        <button onClick={() => onNav('booking')} style={{
          width: '100%', marginTop: 18, background: C.primary, border: 'none',
          borderRadius: R.xl, padding: '16px', color: '#fff', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.md,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau rendez-vous
        </button>
      </div>
    </div>
  )
}

function StatBlock({ value, label, suffix, highlight }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ color: highlight ? C.orange : '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: -0.5 }}>
        {value}{suffix && <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3, opacity: 0.7 }}>{suffix}</span>}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
    </div>
  )
}

function ProBookingCard({ booking: b, onUpdate }) {
  const st   = STATUS_CFG[b.status] || STATUS_CFG.pending
  const mins = b.services?.duration_minutes
  const dur  = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? String(mins % 60).padStart(2, '0') : ''}` : `${mins}min`
  const grad = svcGrad(b.services?.name)

  const NEXT       = { pending: 'confirmed', confirmed: 'in_progress', in_progress: 'completed' }
  const NEXT_LABEL = { pending: 'Confirmer', confirmed: 'Démarrer',    in_progress: 'Terminer'  }

  return (
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, border: `1px solid ${C.separator}`, display: 'flex' }}>
      <div style={{ width: 5, background: grad, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '15px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ color: C.primary, fontSize: 15, fontWeight: 700 }}>{b.profiles?.full_name || 'Client'}</div>
            <div style={{ color: C.secondary, fontSize: 13, marginTop: 2 }}>{b.services?.name} · {dur}</div>
            {b.vehicle && b.vehicle !== 'Non précisé' && (
              <div style={{ color: C.tertiary, fontSize: 12, marginTop: 2 }}>{b.vehicle}</div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ color: C.primary, fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>{b.scheduled_time?.slice(0, 5)}</div>
            <div style={{ background: `${st.color}14`, borderRadius: R.full, padding: '3px 10px', marginTop: 5, border: `1px solid ${st.color}20` }}>
              <span style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.tertiary, fontSize: 13, fontWeight: 600 }}>{b.total_price} €</span>
          {NEXT[b.status] && (
            <button onClick={() => onUpdate(b.id, NEXT[b.status])} style={{
              background: C.primary, border: 'none', borderRadius: R.md, padding: '7px 14px',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            }}>
              {NEXT_LABEL[b.status]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
