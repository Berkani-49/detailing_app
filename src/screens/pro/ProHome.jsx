import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, SHADOW, R, FONT, Spinner, SectionHeader, svcGrad } from '../../components/Shared'

const STATUS_CFG = {
  pending:     { label:'En attente',  color:C.orange },
  confirmed:   { label:'Confirmé',    color:C.blue   },
  in_progress: { label:'En cours',    color:C.indigo },
  completed:   { label:'Terminé',     color:C.green  },
  cancelled:   { label:'Annulé',      color:C.red    },
}

export default function ProHome({ profile, detailer, onNav }) {
  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [stats,       setStats]       = useState({ today: 0, month: 0, pending: 0 })
  const [newBooking, setNewBooking] = useState(false)  // notification temps réel

  useEffect(() => {
    if (!detailer) { setLoading(false); return }
    fetchTodayBookings()
    computeStats()

    // ── Realtime : écoute toute insertion/update de réservation pour ce détailer
    const channel = supabase
      .channel(`pro-home-${detailer.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `detailer_id=eq.${detailer.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') setNewBooking(true)
          fetchTodayBookings()
          computeStats()
        }
      )
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
    <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: FONT }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
      <h2 style={{ color: C.primary, fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Profil nettoyeur incomplet</h2>
      <p style={{ color: C.secondary, fontSize: 15, marginBottom: 24 }}>Configurez votre profil pro pour commencer à recevoir des réservations.</p>
      <button onClick={() => onNav('admin')} style={{ background: C.primary, border: 'none', borderRadius: R.xl, padding: '15px 32px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
        Configurer mon profil
      </button>
    </div>
  )

  return (
    <div style={{ paddingBottom: 24, fontFamily: FONT }}>

      {/* Bannière nouvelle réservation (temps réel) */}
      {newBooking && (
        <div
          onClick={() => { setNewBooking(false); onNav('tracking') }}
          style={{ margin: '8px 20px 0', background: C.green, borderRadius: R.lg, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: SHADOW.md }}
        >
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Nouvelle réservation !</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Appuyez pour voir les détails →</div>
          </div>
          <button onClick={e => { e.stopPropagation(); setNewBooking(false) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: R.full, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '8px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: C.tertiary, fontSize: 14, margin: '0 0 2px' }}>
            {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'} 👋
          </p>
          <h1 style={{ color: C.primary, fontSize: 28, fontWeight: 800, margin: '0 0 2px', letterSpacing: -0.6 }}>{detailer.business_name}</h1>
          <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>{detailer.city} · {new Date().toLocaleDateString('fr-BE', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button onClick={() => onNav('admin')} style={{ width: 46, height: 46, borderRadius: R.full, background: 'linear-gradient(145deg,#1a1a2e,#2d2d4e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.md, flexShrink: 0, border: 'none', cursor: 'pointer' }}>
          <span style={{ color: '#fff', fontSize: 17, fontWeight: 800 }}>{(profile?.full_name || detailer.business_name).split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span>
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 22px' }}>
        <div style={{ background: C.primary, borderRadius: R.xxl, padding: '22px', display: 'flex', gap: 0 }}>
          <StatBlock value={stats.today}            label="RDV aujourd'hui" color="#fff" />
          <div style={{ width: 0.5, background: 'rgba(255,255,255,0.15)', margin: '4px 20px' }} />
          <StatBlock value={`${Math.round(stats.month)} €`} label="CA ce mois"      color="#fff" />
          <div style={{ width: 0.5, background: 'rgba(255,255,255,0.15)', margin: '4px 20px' }} />
          <StatBlock value={stats.pending}          label="En attente"     color={C.orange} />
        </div>
      </div>

      {/* Today's bookings */}
      <div style={{ padding: '0 20px' }}>
        <SectionHeader title={`Aujourd'hui · ${bookings.length} RDV`} action="Voir tout" onAction={() => onNav('tracking')} />
        {loading ? <Spinner /> : bookings.length === 0 ? (
          <div style={{ background: C.card, borderRadius: R.xl, padding: '30px', textAlign: 'center', boxShadow: SHADOW.sm }}>
            <p style={{ color: C.tertiary, fontSize: 16, margin: 0 }}>Aucun rendez-vous aujourd'hui 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(b => (
              <ProBookingCard key={b.id} booking={b} onUpdate={updateStatus} />
            ))}
          </div>
        )}

        <button onClick={() => onNav('booking')} style={{ width: '100%', marginTop: 18, background: C.primary, border: 'none', borderRadius: R.xl, padding: '17px', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.lg }}>
          + Nouveau Rendez-vous
        </button>
      </div>
    </div>
  )
}

function StatBlock({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ color, fontSize: typeof value === 'string' ? 18 : 30, fontWeight: 900, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
    </div>
  )
}

function ProBookingCard({ booking: b, onUpdate }) {
  const st   = STATUS_CFG[b.status] || STATUS_CFG.pending
  const mins = b.services?.duration_minutes
  const dur  = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 || ''}` : `${mins}min`
  const grad = svcGrad(b.services?.name)

  const NEXT = { pending:'confirmed', confirmed:'in_progress', in_progress:'completed' }
  const NEXT_LABEL = { pending:'Confirmer', confirmed:'Démarrer', in_progress:'Terminer' }

  return (
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, display: 'flex' }}>
      <div style={{ width: 6, background: grad, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ color: C.primary, fontSize: 16, fontWeight: 700 }}>{b.profiles?.full_name || 'Client'}</div>
            <div style={{ color: C.secondary, fontSize: 13, marginTop: 2 }}>{b.services?.name} · {dur}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.primary, fontSize: 20, fontWeight: 800 }}>{b.scheduled_time?.slice(0,5)}</div>
            <div style={{ background: `${st.color}18`, borderRadius: R.full, padding: '3px 10px', marginTop: 4 }}>
              <span style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.tertiary, fontSize: 13 }}>{b.total_price} € · {b.vehicle || 'Véhicule non précisé'}</span>
          {NEXT[b.status] && (
            <button onClick={() => onUpdate(b.id, NEXT[b.status])} style={{ background: C.primary, border: 'none', borderRadius: R.md, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              {NEXT_LABEL[b.status]} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
