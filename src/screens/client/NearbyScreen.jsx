import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getCurrentPosition, distanceKm, formatDistance, COUNTRY_LABELS, COUNTRY_CODES } from '../../lib/geo'
import { C, SHADOW, R, FONT, CarSVG, Stars, PillTabs, Spinner } from '../../components/Shared'

const COUNTRIES = ['Tous', ...COUNTRY_CODES]

export default function NearbyScreen({ onSelectDetailer, onBack }) {
  const [detailers, setDetailers] = useState([])
  const [userPos,   setUserPos]   = useState(null)
  const [geoState,  setGeoState]  = useState('idle')
  const [loading,   setLoading]   = useState(true)
  const [country,   setCountry]   = useState('Tous')
  const [search,    setSearch]    = useState('')
  const [radius,    setRadius]    = useState(100)

  useEffect(() => { askGeolocation() }, [])
  useEffect(() => { fetchDetailers(radius) }, [userPos, country, radius])

  const askGeolocation = async () => {
    setGeoState('asking')
    try {
      const pos = await getCurrentPosition()
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setGeoState('granted')
    } catch {
      setGeoState('denied')
      fetchDetailers()
    }
  }

  const fetchDetailers = async (currentRadius = radius) => {
    setLoading(true)
    let query = supabase.from('detailers').select('*').eq('active', true)
    if (country !== 'Tous') query = query.eq('country_code', country)
    const { data, error } = await query.order('rating', { ascending: false })
    if (!error && data) {
      let list = data.map(d => ({
        ...d,
        distance: userPos ? distanceKm(userPos.lat, userPos.lng, d.lat, d.lng) : null,
      }))
      if (userPos) {
        list = list.filter(d => d.distance <= currentRadius).sort((a, b) => a.distance - b.distance)
      }
      setDetailers(list)
    }
    setLoading(false)
  }

  const filtered = detailers.filter(d =>
    d.business_name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase())
  )

  const countryTabs     = COUNTRIES.map(c => c === 'Tous' ? 'Tous' : (COUNTRY_LABELS[c] || c))
  const activeTab       = country === 'Tous' ? 'Tous' : (COUNTRY_LABELS[country] || country)
  const handleCountryChange = (label) => {
    const code = label === 'Tous' ? 'Tous' : Object.entries(COUNTRY_LABELS).find(([, v]) => v === label)?.[0] || label
    setCountry(code)
  }

  return (
    <div style={{ paddingBottom: 28, fontFamily: FONT }}>

      {/* Header */}
      <div style={{ padding: '10px 20px 18px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: C.blue, fontSize: 14, fontFamily: FONT, padding: '0 0 14px', fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Accueil
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: R.full, background: geoState === 'granted' ? C.green : C.tertiary }} />
          <p style={{ color: C.tertiary, fontSize: 13, margin: 0, fontWeight: 500 }}>
            {geoState === 'granted' ? 'Position détectée' : 'Belgique & alentours'}
          </p>
        </div>
        <h1 style={{ color: C.primary, fontSize: 28, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.8 }}>
          Trouver un nettoyeur
        </h1>
        {geoState === 'granted' && (
          <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} dans un rayon de {radius} km
          </p>
        )}
      </div>

      {/* Geo denied banner */}
      {geoState === 'denied' && (
        <div style={{ margin: '0 20px 18px', background: `${C.orange}0D`, borderRadius: R.xl, padding: '14px 16px', border: `1px solid ${C.orange}28`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: R.lg, background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.primary, fontSize: 13, fontWeight: 700 }}>Localisation désactivée</div>
            <div style={{ color: C.secondary, fontSize: 12, marginTop: 2 }}>Activez pour voir les nettoyeurs proches</div>
          </div>
          <button onClick={askGeolocation} style={{ background: C.orange, border: 'none', borderRadius: R.lg, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>
            Activer
          </button>
        </div>
      )}

      {/* Search bar */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ background: C.card, borderRadius: R.xl, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: SHADOW.sm, border: `1px solid ${C.separator}` }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={C.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Nom, ville, prestation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: C.primary, fontFamily: FONT }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: C.fill, border: 'none', borderRadius: R.full, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Country tabs */}
      <div style={{ padding: '0 20px 14px' }}>
        <PillTabs tabs={countryTabs} active={activeTab} onChange={handleCountryChange} />
      </div>

      {/* Radius picker */}
      {geoState === 'granted' && (
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          {[25, 50, 100, 200].map(r => (
            <button key={r} onClick={() => setRadius(r)} style={{
              flex: 1, background: radius === r ? C.primary : C.card,
              border: radius === r ? 'none' : `1px solid ${C.separator}`,
              borderRadius: R.lg, padding: '10px 4px',
              color: radius === r ? '#fff' : C.secondary,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              boxShadow: radius === r ? SHADOW.sm : SHADOW.xs,
            }}>
              {r} km
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: R.xl, background: C.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.tertiary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3 style={{ color: C.primary, fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>Aucun nettoyeur trouvé</h3>
          <p style={{ color: C.secondary, fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
            {search ? `Aucun résultat pour "${search}"` : 'Essayez d\'élargir le rayon ou changer de pays'}
          </p>
          {userPos && (
            <button onClick={() => setRadius(200)} style={{ background: C.primary, border: 'none', borderRadius: R.lg, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              Élargir à 200 km
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(d => (
            <DetailerCard key={d.id} detailer={d} onPress={() => onSelectDetailer(d)} />
          ))}
        </div>
      )}
    </div>
  )
}

function DetailerCard({ detailer: d, onPress }) {
  return (
    <div onClick={onPress} style={{
      background: C.card, borderRadius: R.xl, overflow: 'hidden',
      boxShadow: SHADOW.md, cursor: 'pointer', border: `1px solid ${C.separator}`,
    }}>
      {/* Visual header */}
      <div style={{ height: 110, background: 'linear-gradient(155deg,#0F1E38 0%,#152B55 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CarSVG opacity={0.12} w="68%" />
        </div>

        {/* City badge */}
        <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(255,255,255,0.94)', borderRadius: R.full, padding: '4px 11px' }}>
          <span style={{ color: C.primary, fontSize: 12, fontWeight: 700 }}>{d.city}</span>
        </div>

        {/* Distance badge */}
        {d.distance != null && (
          <div style={{ position: 'absolute', top: 10, right: 12, background: `${C.blue}E6`, borderRadius: R.full, padding: '4px 11px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{formatDistance(d.distance)}</span>
          </div>
        )}

        {/* Verified badge */}
        {d.verified && (
          <div style={{ position: 'absolute', bottom: 10, left: 12, background: `${C.green}E6`, borderRadius: R.full, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Vérifié</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '15px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
            <div style={{ color: C.primary, fontSize: 16, fontWeight: 700, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.business_name}</div>
            <div style={{ color: C.tertiary, fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.address}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Stars rating={d.rating || 0} size={11} />
              <span style={{ color: C.primary, fontSize: 12, fontWeight: 700 }}>{(d.rating || 0).toFixed(1)}</span>
            </div>
            <div style={{ color: C.tertiary, fontSize: 11, marginTop: 2 }}>{d.review_count} avis</div>
          </div>
        </div>

        {d.description && (
          <p style={{ color: C.secondary, fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
            {d.description.length > 85 ? d.description.slice(0, 85) + '…' : d.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {d.phone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.tertiary, fontSize: 12 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1-1a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {d.phone}
            </div>
          ) : <div />}
          <button style={{ background: C.primary, border: 'none', borderRadius: R.lg, padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Voir les services
          </button>
        </div>
      </div>
    </div>
  )
}
