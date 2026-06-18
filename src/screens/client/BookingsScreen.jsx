import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, SHADOW, R, FONT, Spinner } from '../../components/Shared'

const STATUS = {
  pending:     { label: 'En attente', color: C.orange },
  confirmed:   { label: 'Confirmé',   color: C.blue   },
  in_progress: { label: 'En cours',   color: C.indigo },
  completed:   { label: 'Terminé',    color: C.green  },
  cancelled:   { label: 'Annulé',     color: C.red    },
}

export default function BookingsScreen({ profile }) {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('upcoming')

  useEffect(() => { fetchBookings() }, [profile.id])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, detailers(business_name, city, country_code), services(name, duration_minutes)')
      .eq('client_id', profile.id)
      .order('scheduled_date', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const today    = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => b.scheduled_date >= today && b.status !== 'cancelled' && b.status !== 'completed')
  const past     = bookings.filter(b => b.scheduled_date <  today || b.status === 'completed' || b.status === 'cancelled')
  const list     = tab === 'upcoming' ? upcoming : past

  return (
    <div style={{ paddingBottom: 28, fontFamily: FONT }}>

      {/* Header */}
      <div style={{ padding: '10px 20px 18px' }}>
        <h1 style={{ color: C.primary, fontSize: 28, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.8 }}>Mes RDV</h1>
        <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>
          {upcoming.length} à venir · {past.length} passé{past.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Segmented control */}
      <div style={{ display: 'flex', background: C.fill, borderRadius: R.lg, margin: '0 20px 20px', padding: 4 }}>
        {[['upcoming', 'À venir'], ['past', 'Historique']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: R.md, cursor: 'pointer',
            fontFamily: FONT, fontSize: 14, fontWeight: 600, transition: 'all 0.18s',
            background: tab === id ? C.card : 'transparent',
            color: tab === id ? C.primary : C.secondary,
            boxShadow: tab === id ? SHADOW.sm : 'none',
          }}>
            {label}{tab === id && list.length > 0 ? ` (${list.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <div style={{ padding: '44px 28px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: R.xl, background: C.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.tertiary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {tab === 'upcoming'
                ? <><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></>
                : <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>
              }
            </svg>
          </div>
          <h3 style={{ color: C.primary, fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>
            {tab === 'upcoming' ? 'Aucun RDV à venir' : 'Aucun historique'}
          </h3>
          <p style={{ color: C.secondary, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            {tab === 'upcoming' ? 'Réservez votre premier nettoyeur sur DetailPro' : 'Vos RDV passés apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(b => <BookingCard key={b.id} booking={b} profile={profile} onRefresh={fetchBookings} />)}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking: b, profile, onRefresh }) {
  const st      = STATUS[b.status] || STATUS.pending
  const mins    = b.services?.duration_minutes
  const dur     = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60 ? String(mins%60).padStart(2,'0') : ''}` : `${mins}min`
  const dateStr = new Date(b.scheduled_date + 'T00:00').toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'long' })

  const [reviewOpen,    setReviewOpen]    = useState(false)
  const [alreadyReview, setAlreadyReview] = useState(false)

  useEffect(() => {
    if (b.status !== 'completed') return
    supabase.from('reviews').select('id').eq('booking_id', b.id).maybeSingle()
      .then(({ data }) => { if (data) setAlreadyReview(true) })
  }, [b.id])

  const cancel = async () => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    onRefresh()
  }

  if (reviewOpen) return (
    <ReviewSheet
      booking={b}
      profile={profile}
      onClose={() => setReviewOpen(false)}
      onDone={() => { setAlreadyReview(true); setReviewOpen(false) }}
    />
  )

  return (
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.md, border: `1px solid ${C.separator}`, opacity: b.status === 'cancelled' ? 0.6 : 1 }}>
      {/* Status stripe */}
      <div style={{ height: 4, background: st.color }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
            <div style={{ color: C.primary, fontSize: 16, fontWeight: 700, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.services?.name || 'Service'}
            </div>
            <div style={{ color: C.secondary, fontSize: 13 }}>
              {b.detailers?.business_name} · {b.detailers?.city}
            </div>
          </div>
          <div style={{ background: `${st.color}14`, borderRadius: R.full, padding: '4px 12px', border: `1px solid ${st.color}22`, flexShrink: 0 }}>
            <span style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
          </div>
        </div>

        <div style={{ height: 1, background: C.separator, marginBottom: 12 }} />

        {/* Detail chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <InfoChip icon={
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          } value={dateStr} />
          <InfoChip icon={
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          } value={b.scheduled_time?.slice(0, 5)} />
          <InfoChip icon={
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          } value={dur} />
          {b.payment_status === 'paid' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${C.green}12`, borderRadius: R.full, padding: '3px 9px' }}>
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>Payé</span>
            </div>
          )}
        </div>

        {/* Price + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: C.primary, fontSize: 20, fontWeight: 800 }}>{b.total_price} €</span>
            {b.vehicle && <span style={{ color: C.tertiary, fontSize: 12, marginLeft: 8 }}>{b.vehicle}</span>}
          </div>
          {b.status === 'pending' && (
            <button onClick={cancel} style={{ background: `${C.red}0D`, border: `1px solid ${C.red}20`, borderRadius: R.md, padding: '8px 14px', color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              Annuler
            </button>
          )}
          {b.status === 'completed' && (
            alreadyReview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.green}10`, borderRadius: R.md, padding: '7px 12px' }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Avis déposé</span>
              </div>
            ) : (
              <button onClick={() => setReviewOpen(true)} style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}20`, borderRadius: R.md, padding: '8px 14px', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                Laisser un avis
              </button>
            )
          )}
        </div>

        {/* In-progress banner */}
        {b.status === 'in_progress' && (
          <div style={{ marginTop: 14, background: `${C.indigo}0D`, borderRadius: R.md, padding: '10px 14px', border: `1px solid ${C.indigo}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: C.indigo, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600 }}>Votre véhicule est en cours de traitement</span>
            </div>
            <div style={{ height: 4, background: `${C.indigo}20`, borderRadius: 2 }}>
              <div style={{ height: '100%', width: '55%', background: C.indigo, borderRadius: 2 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewSheet({ booking: b, profile, onClose, onDone }) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async () => {
    if (rating === 0) { setError('Veuillez sélectionner une note.'); return }
    setSaving(true); setError(null)
    const { error: err } = await supabase.from('reviews').insert({
      booking_id: b.id, client_id: profile.id, detailer_id: b.detailer_id,
      rating, comment: comment.trim() || null,
    })
    setSaving(false)
    if (err) {
      setError(err.code === '23505' ? 'Vous avez déjà laissé un avis pour ce RDV.' : 'Une erreur est survenue. Réessayez.')
    } else { onDone() }
  }

  return (
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.lg, border: `1px solid ${C.separator}` }}>
      <div style={{ height: 4, background: C.orange }} />
      <div style={{ padding: '20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ color: C.primary, fontSize: 16, fontWeight: 700 }}>Laisser un avis</div>
            <div style={{ color: C.secondary, fontSize: 13, marginTop: 2 }}>{b.detailers?.business_name}</div>
          </div>
          <button onClick={onClose} style={{ background: C.fill, border: 'none', borderRadius: R.full, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ color: C.tertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Votre note</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 34, lineHeight: 1, transition: 'transform 0.1s', transform: (hovered || rating) >= n ? 'scale(1.15)' : 'scale(1)' }}>
                <span style={{ color: (hovered || rating) >= n ? C.orange : C.quaternary }}>★</span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div style={{ color: C.orange, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
              {['','Décevant','Passable','Bien','Très bien','Excellent !'][rating]}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.tertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Commentaire (optionnel)</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Qualité du service, résultat, accueil…"
            rows={3}
            maxLength={500}
            style={{ width: '100%', boxSizing: 'border-box', background: C.fill2, border: `1px solid ${C.separator}`, borderRadius: R.lg, padding: '12px', fontSize: 14, color: C.primary, fontFamily: FONT, outline: 'none', resize: 'none', lineHeight: 1.5 }}
          />
          <div style={{ textAlign: 'right', color: C.quaternary, fontSize: 11, marginTop: 3 }}>{comment.length}/500</div>
        </div>

        {error && (
          <div style={{ background: `${C.red}0D`, borderRadius: R.md, padding: '10px 14px', marginBottom: 14, border: `1px solid ${C.red}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: C.red, fontSize: 13 }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: C.fill, border: 'none', borderRadius: R.lg, padding: '13px', color: C.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || rating === 0} style={{ flex: 2, background: saving || rating === 0 ? C.fill : C.orange, border: 'none', borderRadius: R.lg, padding: '13px', color: saving || rating === 0 ? C.quaternary : '#fff', fontSize: 14, fontWeight: 700, cursor: saving || rating === 0 ? 'default' : 'pointer', fontFamily: FONT }}>
            {saving ? 'Publication…' : 'Publier mon avis'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoChip({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {icon}
      <span style={{ color: C.secondary, fontSize: 12, fontWeight: 500 }}>{value}</span>
    </div>
  )
}
