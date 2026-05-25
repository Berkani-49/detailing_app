import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, SHADOW, R, FONT, CarSVG, Stars, PillTabs, Spinner, svcGrad, StatusBar } from '../../components/Shared'
import { formatDistance } from '../../lib/geo'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CATS = ['Tous', 'Extérieur', 'Intérieur', 'Céramique', 'Premium']

export default function DetailerScreen({ detailer, profile, onBack, onBooked }) {
  const [services,        setServices]        = useState([])
  const [reviews,         setReviews]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [cat,             setCat]             = useState('Tous')
  const [booking,  setBooking]  = useState(null)
  const [bookDone, setBookDone] = useState(false)
  const [isFav,    setIsFav]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('fav_detailers') || '[]').includes(detailer.id) }
    catch { return false }
  })

  const toggleFav = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('fav_detailers') || '[]')
      const next = isFav ? favs.filter(id => id !== detailer.id) : [...favs, detailer.id]
      localStorage.setItem('fav_detailers', JSON.stringify(next))
      setIsFav(!isFav)
    } catch {}
  }

  const openItinerary = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${detailer.lat},${detailer.lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener')
  }

  useEffect(() => {
    Promise.all([fetchServices(), fetchReviews()]).finally(() => setLoading(false))
  }, [detailer.id])

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('detailer_id', detailer.id)
      .eq('active', true)
      .order('price')
    setServices(data || [])
  }

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('detailer_id', detailer.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setReviews(data || [])
  }

  const filtered = cat === 'Tous' ? services : services.filter(s => s.category === cat)

  if (bookDone) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: R.full, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(52,199,89,0.35)' }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: C.primary, fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>Réservation envoyée !</h2>
        <p style={{ color: C.secondary, fontSize: 16, margin: 0 }}>
          {detailer.business_name} confirmera votre réservation sous 24h.
        </p>
      </div>
      <div style={{ width: '100%', background: C.card, borderRadius: R.xl, padding: '20px', boxShadow: SHADOW.md }}>
        <Row label="Nettoyeur"  value={detailer.business_name} />
        <Sep />
        <Row label="Service"    value={booking?.name} />
        <Sep />
        <Row label="Paiement"   value="✓ Payé en ligne" />
        <Sep />
        <Row label="Total"      value={`${booking?.price} €`} bold />
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button onClick={() => { setBookDone(false); setBooking(null) }} style={{ flex: 1, background: C.fill2, border: 'none', borderRadius: R.lg, padding: '14px', color: C.primary, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
          Retour
        </button>
        <button onClick={onBooked} style={{ flex: 1, background: C.primary, border: 'none', borderRadius: R.lg, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.md }}>
          Mes RDV →
        </button>
      </div>
    </div>
  )

  if (booking) return (
    <BookingSheet
      service={booking}
      detailer={detailer}
      profile={profile}
      onBack={() => setBooking(null)}
      onConfirm={() => setBookDone(true)}
    />
  )

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT }}>
      {/* Hero */}
      <div style={{ height: 280, background: 'linear-gradient(160deg,#0f1a2e 0%,#1a2d4a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CarSVG opacity={0.15} w="80%" />
        </div>
        <StatusBar light />
        <div style={{ position: 'absolute', top: 54, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
          <Btn36 onClick={onBack}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Btn36>
          <Btn36 onClick={toggleFav}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill={isFav ? C.red : 'none'} stroke={isFav ? C.red : C.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </Btn36>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />
      </div>

      {/* Sheet */}
      <div style={{ background: C.bg, borderRadius: '24px 24px 0 0', marginTop: -12, padding: '24px 20px 120px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: C.primary, fontSize: 24, fontWeight: 800, margin: '0 0 5px', letterSpacing: -0.5 }}>{detailer.business_name}</h2>
            <div style={{ color: C.secondary, fontSize: 14 }}>
              {countryFlag(detailer.country_code)} {detailer.city} · {detailer.address}
            </div>
          </div>
          {detailer.verified && (
            <div style={{ background: '#E8FFF1', borderRadius: R.full, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Vérifié</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Stars rating={detailer.rating || 0} />
          <span style={{ color: C.primary, fontSize: 14, fontWeight: 700 }}>{(detailer.rating || 0).toFixed(1)}</span>
          <span style={{ color: C.tertiary, fontSize: 14 }}>{detailer.review_count} avis</span>
          {detailer.distance != null && (
            <span style={{ color: C.blue, fontSize: 14, marginLeft: 4 }}>· 📍 {formatDistance(detailer.distance)}</span>
          )}
        </div>

        {detailer.phone && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <a href={`tel:${detailer.phone}`} style={{ flex: 1, background: C.card, borderRadius: R.lg, padding: '12px', textAlign: 'center', textDecoration: 'none', boxShadow: SHADOW.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1-1a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.92z"/>
              </svg>
              <span style={{ color: C.primary, fontSize: 14, fontWeight: 600 }}>Appeler</span>
            </a>
            <div onClick={openItinerary} style={{ flex: 1, background: C.card, borderRadius: R.lg, padding: '12px', textAlign: 'center', boxShadow: SHADOW.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ color: C.primary, fontSize: 14, fontWeight: 600 }}>Itinéraire</span>
            </div>
          </div>
        )}

        <div style={{ height: 0.5, background: C.separator, marginBottom: 22 }} />

        {/* Services */}
        <h3 style={{ color: C.primary, fontSize: 20, fontWeight: 700, marginBottom: 14, letterSpacing: -0.3 }}>Services & tarifs</h3>

        {loading ? <Spinner /> : (
          <>
            <div style={{ marginBottom: 18 }}>
              <PillTabs tabs={CATS} active={cat} onChange={setCat} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {filtered.map(svc => (
                <ServiceRow key={svc.id} svc={svc} onBook={() => setBooking(svc)} />
              ))}
              {filtered.length === 0 && (
                <p style={{ color: C.tertiary, textAlign: 'center', padding: '20px 0' }}>Aucun service dans cette catégorie</p>
              )}
            </div>
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <div style={{ height: 0.5, background: C.separator, marginBottom: 22 }} />
            <h3 style={{ color: C.primary, fontSize: 20, fontWeight: 700, marginBottom: 14, letterSpacing: -0.3 }}>Avis clients</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: C.card, borderRadius: R.lg, padding: '16px', boxShadow: SHADOW.sm }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: C.primary, fontSize: 14, fontWeight: 600 }}>{r.profiles?.full_name || 'Client anonyme'}</span>
                    <Stars rating={r.rating} size={11} />
                  </div>
                  {r.comment && <p style={{ color: C.secondary, fontSize: 14, margin: 0, lineHeight: 1.5 }}>{r.comment}</p>}
                  <p style={{ color: C.quaternary, fontSize: 12, margin: '6px 0 0' }}>{new Date(r.created_at).toLocaleDateString('fr-BE')}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ServiceRow({ svc, onBook }) {
  const grad = svcGrad(svc.name)
  const mins = svc.duration_minutes
  const dur  = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60 ? String(mins%60).padStart(2,'0') : ''}` : `${mins} min`
  return (
    <div style={{ background: C.card, borderRadius: R.lg, overflow: 'hidden', boxShadow: SHADOW.sm }}>
      <div style={{ height: 6, background: grad }} />
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.primary, fontSize: 16, fontWeight: 700 }}>{svc.name}</div>
          <div style={{ color: C.tertiary, fontSize: 13, marginTop: 3 }}>{dur} · {svc.category}</div>
          {svc.description && <div style={{ color: C.secondary, fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{svc.description}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: C.primary, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{svc.price}<span style={{ fontSize: 14, fontWeight: 500 }}>€</span></div>
          <button onClick={onBook} style={{ marginTop: 8, background: C.primary, border: 'none', borderRadius: R.md, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

const ONLINE_METHODS  = ['bancontact', 'card']
const ALL_PAY_METHODS = [
  { id: 'card',       label: 'Carte',      icon: '💳', online: true  },
  { id: 'bancontact', label: 'Bancontact', icon: '📱', online: true  },
  { id: 'cash',       label: 'Espèces',    icon: '💵', online: false },
  { id: 'transfer',   label: 'Virement',   icon: '🏦', online: false },
]

function BookingSheet({ service, detailer, profile, onBack, onConfirm }) {
  const [step,          setStep]          = useState(1)
  const [day,           setDay]           = useState(null)
  const [slot,          setSlot]          = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [form,          setForm]          = useState({ vehicle: '', notes: '' })

  const DAYS  = generateDays(14)
  const SLOTS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00']

  const useOnlinePayment = ONLINE_METHODS.includes(paymentMethod)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h2 style={{ color: C.primary, fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{service.name}</h2>
          <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>{detailer.business_name} · {service.price} €</p>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 6, padding: '20px 20px 0' }}>
        {['Date', 'Heure', 'Infos', 'Paiement'].map((t, i) => (
          <div key={t} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: i < step ? C.primary : C.fill, transition: 'background 0.3s' }} />
            <div style={{ color: i < step ? C.primary : C.quaternary, fontSize: 10, fontWeight: 600, marginTop: 5, textAlign: 'center' }}>{t}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 20px 40px' }}>
        {step === 1 && (
          <>
            <h3 style={{ color: C.primary, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Choisir une date</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {DAYS.map(d => (
                <button key={d.iso} onClick={() => setDay(d)} style={{
                  background: day?.iso === d.iso ? C.primary : C.card, color: day?.iso === d.iso ? '#fff' : C.primary,
                  border: 'none', borderRadius: R.md, padding: '14px 6px', cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.xs,
                }}>
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', marginBottom: 3 }}>{d.dow}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{d.day}</div>
                  <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>{d.month}</div>
                </button>
              ))}
            </div>
            <Cta disabled={!day} onClick={() => setStep(2)}>Continuer →</Cta>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ color: C.primary, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Choisir un créneau</h3>
            <p style={{ color: C.secondary, fontSize: 14, marginBottom: 16 }}>{day?.label}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {SLOTS.map(s => (
                <button key={s} onClick={() => setSlot(s)} style={{
                  background: slot === s ? C.primary : C.card, color: slot === s ? '#fff' : C.primary,
                  border: 'none', borderRadius: R.md, padding: '16px 8px', cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.xs,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{s}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <BackBtn onClick={() => setStep(1)} />
              <Cta disabled={!slot} onClick={() => setStep(3)} flex={2}>Continuer →</Cta>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ color: C.primary, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Vos informations</h3>
            <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, marginBottom: 16 }}>
              <div style={{ padding: '14px 18px' }}>
                <label style={{ color: C.tertiary, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Votre véhicule</label>
                <input placeholder="BMW M4 Gris Nardo" value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: 'none', outline: 'none', fontSize: 16, color: C.primary, fontFamily: FONT }} />
              </div>
              <div style={{ height: 0.5, background: C.separator, marginLeft: 18 }} />
              <div style={{ padding: '14px 18px' }}>
                <label style={{ color: C.tertiary, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes (optionnel)</label>
                <input placeholder="Ex : carrosserie à inspecter côté conducteur…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: 'none', outline: 'none', fontSize: 15, color: C.primary, fontFamily: FONT }} />
              </div>
            </div>

            {/* Sélecteur mode de paiement */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: C.tertiary, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
                Mode de paiement
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_PAY_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      background: paymentMethod === pm.id ? C.primary : C.card,
                      border: `2px solid ${paymentMethod === pm.id ? C.primary : 'transparent'}`,
                      borderRadius: R.lg, padding: '14px 12px', cursor: 'pointer',
                      fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: SHADOW.sm, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{pm.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: paymentMethod === pm.id ? '#fff' : C.primary, fontSize: 13, fontWeight: 700 }}>
                        {pm.label}
                      </div>
                      <div style={{ color: paymentMethod === pm.id ? 'rgba(255,255,255,0.65)' : C.tertiary, fontSize: 10, marginTop: 1 }}>
                        {pm.online ? 'En ligne' : 'Sur place'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <BackBtn onClick={() => setStep(2)} />
              <Cta onClick={() => setStep(4)} flex={2}>
                {useOnlinePayment ? 'Payer en ligne →' : 'Continuer →'}
              </Cta>
            </div>
          </>
        )}

        {step === 4 && (
          useOnlinePayment ? (
            <StripePaymentStep
              service={service}
              detailer={detailer}
              profile={profile}
              day={day}
              slot={slot}
              form={form}
              paymentMethod={paymentMethod}
              onBack={() => setStep(3)}
              onSuccess={onConfirm}
            />
          ) : (
            <OfflineBookingStep
              service={service}
              detailer={detailer}
              profile={profile}
              day={day}
              slot={slot}
              form={form}
              paymentMethod={paymentMethod}
              onBack={() => setStep(3)}
              onSuccess={onConfirm}
            />
          )
        )}
      </div>
    </div>
  )
}

// ─── Stripe Payment ───────────────────────────────────────────────────────────

function StripePaymentStep({ service, detailer, profile, day, slot, form, paymentMethod, onBack, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)

  useEffect(() => {
    supabase.functions.invoke('create-payment-intent', {
      body: {
        amount:            service.price,
        description:       `${service.name} — ${detailer.business_name}`,
        stripe_account_id: detailer.stripe_account_id || null,
      },
    })
      .then(({ data, error }) => {
        if (error) throw new Error(error.message)
        if (data?.error) throw new Error(data.error)
        setClientSecret(data.client_secret)
      })
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <Spinner />
      <p style={{ color: C.secondary, fontSize: 14, marginTop: 12 }}>Initialisation du paiement…</p>
    </div>
  )

  if (fetchError) return (
    <div style={{ padding: '20px 0' }}>
      <p style={{ color: C.red, fontSize: 14, marginBottom: 20 }}>⚠ {fetchError}</p>
      <BackBtn onClick={onBack} />
    </div>
  )

  const appearance = {
    theme: 'flat',
    variables: {
      colorPrimary: '#007AFF',
      colorBackground: '#F2F2F7',
      colorText: '#1C1C1E',
      colorTextSecondary: '#6C6C70',
      colorDanger: '#FF3B30',
      borderRadius: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontSizeBase: '15px',
    },
    rules: {
      '.Input': { padding: '14px 16px', boxShadow: 'none' },
      '.Label': { fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#6C6C70' },
    },
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm
        service={service}
        detailer={detailer}
        profile={profile}
        day={day}
        slot={slot}
        form={form}
        paymentMethod={paymentMethod}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}

function CheckoutForm({ service, detailer, profile, day, slot, form, paymentMethod, onBack, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error,  setError]  = useState(null)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setPaying(true)
    setError(null)

    // ── Vérification anti double-réservation ──────────────────────────────────
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('detailer_id', detailer.id)
      .eq('scheduled_date', day.iso)
      .eq('scheduled_time', `${slot}:00`)
      .neq('status', 'cancelled')

    if (count && count > 0) {
      setError("Ce créneau vient d'être réservé par quelqu'un d'autre. Veuillez en choisir un autre.")
      setPaying(false)
      return
    }

    // ── Sauvegarder le booking avant le redirect Stripe ───────────────────────
    // Nécessaire pour les méthodes qui redirigent (Bancontact, iDEAL, 3D Secure…)
    // L'app récupère ces données à son retour via App.jsx
    const [h, m] = slot.split(':')
    sessionStorage.setItem('detailpro_pending_booking', JSON.stringify({
      client_id:      profile.id,
      detailer_id:    detailer.id,
      service_id:     service.id,
      vehicle:        form.vehicle || 'Non précisé',
      scheduled_date: day.iso,
      scheduled_time: `${h}:${m}:00`,
      notes:          form.notes || null,
      total_price:    service.price,
      payment_method: paymentMethod,
    }))

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // return_url obligatoire pour Bancontact, iDEAL, 3D Secure, etc.
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    })

    // Si on arrive ici, pas de redirect → paiement traité directement
    if (stripeError) {
      sessionStorage.removeItem('detailpro_pending_booking')
      setError(stripeError.message)
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      const { error: dbError } = await supabase.from('bookings').insert({
        client_id:                profile.id,
        detailer_id:              detailer.id,
        service_id:               service.id,
        vehicle:                  form.vehicle || 'Non précisé',
        scheduled_date:           day.iso,
        scheduled_time:           `${h}:${m}:00`,
        status:                   'pending',
        notes:                    form.notes || null,
        total_price:              service.price,
        payment_method:           paymentMethod,
        payment_status:           'paid',
        stripe_payment_intent_id: paymentIntent.id,
      })
      sessionStorage.removeItem('detailpro_pending_booking')
      setPaying(false)
      if (dbError) { setError('Paiement réussi mais erreur de réservation. Contactez le support.'); return }
      onSuccess()
    }
  }

  return (
    <div>
      {/* Récapitulatif */}
      <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, marginBottom: 20 }}>
        <div style={{ padding: '12px 18px 8px' }}>
          <span style={{ color: C.tertiary, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Récapitulatif</span>
        </div>
        <Row label="Service" value={service.name} />
        <Sep />
        <Row label="Nettoyeur" value={detailer.business_name} />
        <Sep />
        <Row label="Date" value={`${day?.label} à ${slot}`} />
        <Sep />
        <Row label="Total" value={`${service.price} €`} bold />
      </div>

      {/* Stripe PaymentElement — gère Apple Pay, Bancontact, cartes */}
      <div style={{ marginBottom: 20 }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && <p style={{ color: C.red, fontSize: 14, marginBottom: 14 }}>⚠ {error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <BackBtn onClick={onBack} />
        <Cta disabled={!stripe || !elements || paying} onClick={handlePay} flex={2}>
          {paying ? 'Paiement en cours…' : `Payer ${service.price} €`}
        </Cta>
      </div>
    </div>
  )
}

// ─── Réservation sans paiement en ligne (nettoyeur sans Stripe Connect) ───────
function OfflineBookingStep({ service, detailer, profile, day, slot, form, paymentMethod, onBack, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const methodLabel = ALL_PAY_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod

  const handleConfirm = async () => {
    setSaving(true)
    const [h, m] = slot.split(':')
    const { error: dbError } = await supabase.from('bookings').insert({
      client_id:      profile.id,
      detailer_id:    detailer.id,
      service_id:     service.id,
      vehicle:        form.vehicle || 'Non précisé',
      scheduled_date: day.iso,
      scheduled_time: `${h}:${m}:00`,
      status:         'pending',
      notes:          form.notes || null,
      total_price:    service.price,
      payment_method: paymentMethod,
      payment_status: 'unpaid',
    })
    setSaving(false)
    if (dbError) { setError('Erreur lors de la réservation. Réessayez.'); return }
    onSuccess()
  }

  return (
    <div>
      <div style={{ background: C.card, borderRadius: R.xl, overflow: 'hidden', boxShadow: SHADOW.sm, marginBottom: 20 }}>
        <div style={{ padding: '12px 18px 8px' }}>
          <span style={{ color: C.tertiary, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Récapitulatif</span>
        </div>
        <Row label="Service"   value={service.name} />
        <Sep />
        <Row label="Nettoyeur" value={detailer.business_name} />
        <Sep />
        <Row label="Date"      value={`${day?.label} à ${slot}`} />
        <Sep />
        <Row label="Paiement"  value={`${methodLabel} · sur place`} />
        <Sep />
        <Row label="Total"     value={`${service.price} €`} bold />
      </div>

      <div style={{ background: '#FFF8E8', borderRadius: R.lg, padding: '14px 18px', marginBottom: 20, border: '1px solid rgba(255,149,0,0.2)' }}>
        <div style={{ color: '#CC7A00', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>💡 Paiement à la prestation</div>
        <div style={{ color: '#996600', fontSize: 13, lineHeight: 1.5 }}>
          Réglez en <strong>{methodLabel}</strong> directement lors de votre rendez-vous.
        </div>
      </div>

      {error && <p style={{ color: C.red, fontSize: 14, marginBottom: 14 }}>⚠ {error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <BackBtn onClick={onBack} />
        <Cta disabled={saving} onClick={handleConfirm} flex={2}>
          {saving ? 'Réservation…' : 'Confirmer la réservation ✓'}
        </Cta>
      </div>
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Btn36({ onClick, children }) {
  return (
    <div onClick={onClick} style={{ width: 40, height: 40, borderRadius: R.full, background: 'rgba(255,255,255,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW.md }}>
      {children}
    </div>
  )
}

function Cta({ disabled, onClick, children, flex = 1 }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{ flex, background: disabled ? C.fill : C.primary, border: 'none', borderRadius: R.lg, padding: '16px', color: disabled ? C.quaternary : '#fff', fontSize: 15, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', fontFamily: FONT, boxShadow: disabled ? 'none' : SHADOW.md }}>
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, background: C.card, border: 'none', borderRadius: R.lg, padding: '14px', color: C.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, boxShadow: SHADOW.sm }}>
      ← Retour
    </button>
  )
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px' }}>
      <span style={{ color: C.secondary, fontSize: 14 }}>{label}</span>
      <span style={{ color: C.primary, fontSize: 14, fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

function Sep() {
  return <div style={{ height: 0.5, background: C.separator, marginLeft: 18 }} />
}

function countryFlag(code) {
  return { BE:'🇧🇪', FR:'🇫🇷', NL:'🇳🇱', LU:'🇱🇺', DE:'🇩🇪' }[code] || '🌍'
}

function generateDays(n) {
  const days = []
  const DOW = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const MON = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  for (let i = 1; i <= n; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      iso:   d.toISOString().split('T')[0],
      dow:   DOW[d.getDay()],
      day:   d.getDate(),
      month: MON[d.getMonth()],
      label: `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`,
    })
  }
  return days
}
