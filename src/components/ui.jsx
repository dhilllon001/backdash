export function Chip({ tone = 'neutral', children, xs }) {
  return (
    <span className={`chip ${tone}${xs ? ' xs' : ''}`}>
      <i />
      {children}
    </span>
  )
}

export function Kpi({ label, value, unit, sub, alert }) {
  return (
    <div className={`kpi${alert ? ' alert' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">
        <span className="n">{value}</span>
        {unit ? <span className="unit">{unit}</span> : null}
      </div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  )
}

/** Normalize photo entries: string URL, hex color, or { src, label }. */
export function PhotoThumbs({ photos, labels }) {
  const items = (photos || []).map((p, i) => {
    if (typeof p === 'string') {
      const isUrl = p.startsWith('/') || p.startsWith('http') || p.startsWith('data:')
      return isUrl
        ? { src: p, label: labels?.[i] }
        : { color: p, label: labels?.[i] }
    }
    return { src: p.src, color: p.color, label: p.label || labels?.[i] }
  })

  return (
    <div className="photo-thumbs">
      {items.map((item, i) => (
        <div
          key={i}
          className="photo-thumb"
          style={item.src ? undefined : { background: item.color || '#c5ced9' }}
        >
          {item.src ? <img src={item.src} alt={item.label || `Photo ${i + 1}`} /> : null}
          {item.label ? <span>{item.label}</span> : null}
        </div>
      ))}
    </div>
  )
}

/** Format 24h "HH:MM" → "h:mm AM/PM" for cleaner ledger display. */
export function formatClock(t) {
  if (!t) return '—'
  const [hh, mm] = t.split(':').map(Number)
  if (Number.isNaN(hh)) return t
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`
}

/** Stable display Shift ID (9-digit ops style). Uses shiftCode when present. */
export function formatShiftId(shift, empId = '') {
  if (!shift || shift.dayOff) return null
  if (shift.shiftCode) return String(shift.shiftCode)
  const raw = `${empId}|${shift.id || ''}|${shift.date || ''}`
  let h = 2166136261
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return String(210000000 + ((h >>> 0) % 89000000))
}
