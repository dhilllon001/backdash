import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Chip } from '../../components/ui.jsx'
import {
  VISITORS,
  formatVisitorTime,
  formatVisitorDate,
  visitorsOnSite,
} from '../../data/security.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'on_site', label: 'On site' },
  { id: 'departed', label: 'Departed' },
]

const AVATAR = [
  { bg: '#EEF1FD', color: '#2B4FD3' },
  { bg: '#E6F5F6', color: '#1E7E82' },
  { bg: '#F3EEF8', color: '#6B4E9B' },
  { bg: '#FFF1E8', color: '#C45C26' },
  { bg: '#E8F6EE', color: '#1F7A43' },
]

function visitorInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function avatarStyle(id) {
  const n = String(id || '')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR[n % AVATAR.length]
}

export function VisitorsView() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(VISITORS[0]?.id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return VISITORS.filter((v) => {
      if (filter !== 'all' && v.status !== filter) return false
      if (!q) return true
      const hay = `${v.name} ${v.type} ${v.company} ${v.plate} ${v.yard} ${v.id}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, filter])

  const selected = filtered.find((v) => v.id === selectedId) || filtered[0] || null
  const onSiteCount = visitorsOnSite().length

  return (
    <section className="vis page">
      <header className="vis-head">
        <div>
          <h1 className="vis-title">Visitors</h1>
          <p className="vis-sub">
            {onSiteCount} on site · {VISITORS.length} total this week
          </p>
        </div>
        <label className="vis-search">
          <Search size={15} strokeWidth={2} />
          <input
            type="search"
            placeholder="Search name, plate, company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="vis-filters" role="group" aria-label="Visitor status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? 'on' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="vis-layout">
        <div className="vis-list-panel">
          <div className="vis-table-head" aria-hidden="true">
            <span>Visitor</span>
            <span>Type</span>
            <span>Yard</span>
            <span>Status</span>
          </div>
          <div className="vis-list">
            {filtered.length === 0 ? (
              <div className="vis-list-empty">No visitors match these filters.</div>
            ) : (
              filtered.map((v) => {
                const av = avatarStyle(v.id)
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`vis-row${selected?.id === v.id ? ' on' : ''}`}
                    onClick={() => setSelectedId(v.id)}
                  >
                    <div className="vis-row-person">
                      <span className="vis-av" style={{ background: av.bg, color: av.color }}>
                        {visitorInitials(v.name)}
                      </span>
                      <span className="vis-row-name">
                        <b>{v.name}</b>
                        <span className="muted">{v.company}</span>
                      </span>
                    </div>
                    <span className="vis-row-type">{v.type}</span>
                    <span className="vis-row-yard muted">{v.yard}</span>
                    <span className={`vis-status ${v.status}`}>
                      {v.status === 'on_site' ? 'On site' : 'Departed'}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {selected ? (
          <div className="vis-detail">
            <div className="vis-detail-head">
              <div className="vis-detail-identity">
                <span
                  className="vis-av lg"
                  style={{
                    background: avatarStyle(selected.id).bg,
                    color: avatarStyle(selected.id).color,
                  }}
                >
                  {visitorInitials(selected.name)}
                </span>
                <div>
                  <span className="vis-detail-label">VISITOR</span>
                  <h2>{selected.name}</h2>
                  <div className="vis-detail-tags">
                    <Chip tone={selected.status === 'on_site' ? 'ok' : 'muted'}>
                      {selected.status === 'on_site' ? 'On site' : 'Departed'}
                    </Chip>
                    <Chip tone="info">{selected.type}</Chip>
                    <span className="vis-detail-id num">{selected.id}</span>
                  </div>
                </div>
              </div>
              <dl className="vis-facts">
                <div>
                  <dt>Company</dt>
                  <dd>{selected.company}</dd>
                </div>
                <div>
                  <dt>Plate</dt>
                  <dd className="num">{selected.plate}</dd>
                </div>
                <div>
                  <dt>Yard</dt>
                  <dd>{selected.yard}</dd>
                </div>
                <div>
                  <dt>Check-in</dt>
                  <dd className="num">
                    {formatVisitorDate(selected.checkedIn)} {formatVisitorTime(selected.checkedIn)}
                  </dd>
                </div>
                <div>
                  <dt>Check-out</dt>
                  <dd className="num">
                    {selected.checkedOut
                      ? formatVisitorTime(selected.checkedOut)
                      : 'Still on site'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="vis-timeline">
              <h3>Check-in timeline</h3>
              <ul className="vis-timeline-list">
                {(selected.timeline || []).map((ev, i) => (
                  <li key={i}>
                    <span className="vis-tl-time num">{ev.time}</span>
                    <div className="vis-tl-body">
                      <b>{ev.label}</b>
                      <span className="muted">{ev.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vis-photos">
              <h3>Gate photos</h3>
              <div className="vis-photo-grid">
                {(selected.photos || []).map((p, i) => (
                  <figure key={i} className="vis-photo">
                    <img src={p.src} alt={p.label} />
                    <figcaption>
                      <b>{p.label}</b>
                      <span className="num">{p.time}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="vis-detail vis-detail-empty">Select a visitor to view details.</div>
        )}
      </div>
    </section>
  )
}
