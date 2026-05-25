import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, SHADOW, R, FONT, Spinner, EmptyState } from '../../components/Shared'

const STATUS = {
  pending:     { label:'En attente',  color:C.orange, bg:'#FFF8E8' },
  confirmed:   { label:'Confirmé',    color:C.blue,   bg:'#EBF5FF' },
  in_progress: { label:'En cours',    color:C.indigo, bg:'#F0EEFF' },
  completed:   { label:'Terminé',     color:C.green,  bg:'#E8FFF1' },
  cancelled:   { label:'Annulé',      color:C.red,    bg:'#FFF2F2' },
}

export default function BookingsScreen({ profile, onBack }) {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [profile.id])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        detailers ( business_name, city, country_code ),
        services  ( name, duration_minutes )
      `)
      .eq('client_id', profile.id)
      .order('scheduled_date', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  const upcoming = bookings.filter(b => b.scheduled_date >= today && b.status !== 'cancelled' && b.status !== 'completed')
  const past     = bookings.filter(b => b.scheduled_date < today  || b.status === 'completed' || b.status === 'cancelled')

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div style={{ paddingBottom: 24, fontFamily: FONT }}>
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h1 style={{ color: C.primary, fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: -0.8 }}>Mes RDV</h1>
          {onBack && (
            <button onClick={onBack} style={{ background: C.fill, border: 'none', borderRadius: R.lg, padding: '9px 16px', color: C.secondary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.secondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Accueil
            </button>
          )}
        </div>
        <p style={{ color: C.secondary, fontSize: 15, margin: 0 }}>Vos rendez-vous chez le nettoyeur</p>
      </div>

      {/* Tab switch */}
      <div style={{ display: 'flex', background: C.fill, borderRadius: R.lg, margin: '0 20px 20px', padding: 4 }}>
        {[['upcoming','À venir'], ['past','Historique']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: R.md, cursor: 'pointer',
            fontFamily: FONT, fontSize: 14, fontWeight: 600, transition: 'all 0.18s',
            background: tab === id ? C.card : 'transparent',
            color: tab === id ? C.primary : C.secondary,
            boxShadow: tab === id ? SHADOW.sm : 'none',
          }}>
            {label} {tab === id && list.length > 0 && `(${list.length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState
          icon={tab === 'upcoming' ? '📅' : '🕐'}
          title={tab === 'upcoming' ? 'Aucun RDV à venir' : 'Aucun historique'}
          subtitle={tab === 'upcoming' ? 'Réservez votre premier nettoyeur sur DetailPro' : 'Vos RDV passés apparaîtront ici'}
        />
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map(b => <BookingCard key={b.id} booking={b} profile={profile} onRefresh={fetchBookings} />)}
        </div>
      )}
    </div>
  )
}

// ─── BookingCard ──────────────────────────────────────────────────────────────
function BookingCard({ booking: b, profile, onRefresh }) {
  const st      = STATUS[b.status] || STATUS.pending
  const mins    = b.services?.duration_minutes
  const dur     = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60||''}` : `${mins}min`
  const flag    = { BE:'🇧🇪', FR:'🇫🇷', NL:'🇳🇱', LU:'🇱🇺', DE:'🇩🇪' }[b.detailers?.country_code] || '🌍'
  const dateStr = new Date(b.scheduled_date + 'T00:00').toLocaleDateString('fr-BE', { weekday:'long', day:'numeric', month:'long' })

  const [reviewOpen,    setReviewOpen]    = useState(false)
  const [alreadyReview, setAlreadyReview] = useState(false)

  // Vérifie si un avis existe déjà pour ce booking
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
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.md }}>
      {/* Color stripe by status */}
      <div style={{ height: 4, background: st.color }} />

      <div style={{ padding: '18px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.primary, fontSize: 17, fontWeight: 700, marginBottom: 3 }}>
              {b.services?.name || 'Service'}
            </div>
            <div style={{ color: C.secondary, fontSize: 14 }}>
              {flag} {b.detailers?.business_name} · {b.detailers?.city}
            </div>
          </div>
          <div style={{ background: st.bg, borderRadius: R.full, padding: '5px 12px' }}>
            <span style={{ color: st.color, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
          </div>
        </div>

        <div style={{ height: 0.5, background: C.separator, marginBottom: 12 }} />

        {/* Details grid */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <InfoChip icon="📅" value={dateStr} />
          <InfoChip icon="🕐" value={b.scheduled_time?.slice(0, 5)} />
          <InfoChip icon="⏱" value={dur} />
          <InfoChip icon={b.payment_status === 'paid' ? '✅' : '🔲'} value={b.payment_status === 'paid' ? 'Payé' : 'Non payé'} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: C.primary, fontSize: 20, fontWeight: 800 }}>{b.total_price} €</span>
            {b.vehicle && (
              <span style={{ color: C.tertiary, fontSize: 13, marginLeft: 10 }}>· {b.vehicle}</span>
            )}
          </div>
          {b.status === 'pending' && (
            <button onClick={cancel} style={{ background: '#FFF2F2', border: 'none', borderRadius: R.md, padding: '8px 16px', color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              Annuler
            </button>
          )}
          {b.status === 'completed' && (
            alreadyReview ? (
              <div style={{ background: '#E8FFF1', borderRadius: R.md, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Avis déposé</span>
              </div>
            ) : (
              <button onClick={() => setReviewOpen(true)} style={{ background: '#FFF8E8', border: 'none', borderRadius: R.md, padding: '8px 16px', color: C.orange, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                Laisser un avis ★
              </button>
            )
          )}
        </div>

        {/* Progress bar for in_progress */}
        {b.status === 'in_progress' && (
          <div style={{ marginTop: 14, background: '#F0EEFF', borderRadius: R.md, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: C.indigo }} />
              <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600 }}>Votre véhicule est en cours de traitement</span>
            </div>
            <div style={{ height: 4, background: 'rgba(88,86,214,0.2)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: '55%', background: C.indigo, borderRadius: 2 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ReviewSheet ──────────────────────────────────────────────────────────────
function ReviewSheet({ booking: b, profile, onClose, onDone }) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async () => {
    if (rating === 0) { setError('Veuillez sélectionner une note.'); return }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('reviews').insert({
      booking_id:  b.id,
      client_id:   profile.id,
      detailer_id: b.detailer_id,
      rating,
      comment:     comment.trim() || null,
    })
    setSaving(false)
    if (err) {
      if (err.code === '23505') { setError('Vous avez déjà laissé un avis pour ce RDV.') }
      else { setError('Une erreur est survenue. Réessayez.') }
    } else {
      onDone()
    }
  }

  return (
    <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.md }}>
      <div style={{ height: 4, background: C.orange }} />
      <div style={{ padding: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: C.primary, fontSize: 17, fontWeight: 700 }}>Laisser un avis</div>
            <div style={{ color: C.secondary, fontSize: 13, marginTop: 2 }}>{b.detailers?.business_name}</div>
          </div>
          <button onClick={onClose} style={{ background: C.fill, border: 'none', borderRadius: R.full, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Star selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: C.tertiary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Votre note</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: 36, lineHeight: 1, transition: 'transform 0.1s', transform: (hovered || rating) >= n ? 'scale(1.12)' : 'scale(1)' }}
              >
                <span style={{ color: (hovered || rating) >= n ? C.orange : C.quaternary }}>★</span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div style={{ color: C.orange, fontSize: 13, fontWeight: 600, marginTop: 6 }}>
              {['','Décevant','Passable','Bien','Très bien','Excellent !'][rating]}
            </div>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.tertiary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Commentaire (optionnel)</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Décrivez votre expérience : qualité du service, accueil, résultat…"
            rows={3}
            maxLength={500}
            style={{ width: '100%', boxSizing: 'border-box', background: C.fill2, border: `1.5px solid ${C.separator}`, borderRadius: R.md, padding: '12px', fontSize: 14, color: C.primary, fontFamily: FONT, outline: 'none', resize: 'none', lineHeight: 1.5 }}
          />
          <div style={{ textAlign: 'right', color: C.quaternary, fontSize: 11, marginTop: 3 }}>{comment.length}/500</div>
        </div>

        {error && (
          <div style={{ background: '#FFF2F2', borderRadius: R.sm, padding: '10px 14px', marginBottom: 14, border: '1px solid rgba(255,59,48,0.2)' }}>
            <span style={{ color: C.red, fontSize: 13 }}>⚠ {error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: C.fill, border: 'none', borderRadius: R.lg, padding: '13px', color: C.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || rating === 0}
            style={{ flex: 2, background: saving || rating === 0 ? C.fill : C.orange, border: 'none', borderRadius: R.lg, padding: '13px', color: saving || rating === 0 ? C.quaternary : '#fff', fontSize: 14, fontWeight: 700, cursor: saving || rating === 0 ? 'default' : 'pointer', fontFamily: FONT, boxShadow: rating > 0 ? SHADOW.md : 'none' }}
          >
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
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: C.secondary, fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  )
}
