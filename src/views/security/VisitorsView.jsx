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
        <div className="vis-list card">
          {filtered.length === 0 ? (
            <div className="vis-list-empty">No visitors match these filters.</div>
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`vis-row${selected?.id === v.id ? ' on' : ''}`}
                onClick={() => setSelectedId(v.id)}
              >
                <div className="vis-row-thumb">
                  {v.photos?.[0]?.src ? (
                    <img src={v.photos[0].src} alt="" />
                  ) : (
                    <span>{v.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="vis-row-main">
                  <div className="vis-row-top">
                    <b>{v.name}</b>
                    <span className={`vis-status ${v.status}`}>
                      {v.status === 'on_site' ? 'On site' : 'Departed'}
                    </span>
                  </div>
                  <span className="vis-row-type">{v.type}</span>
                  <span className="vis-row-meta muted">
                    {v.plate} · {v.company} · {v.yard}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {selected ? (
          <div className="vis-detail card">
            <div className="vis-detail-head">
              <span className="vis-detail-label">VISITOR DETAILS</span>
              <h2>{selected.name}</h2>
              <div className="vis-detail-tags">
                <Chip tone={selected.status === 'on_site' ? 'ok' : 'muted'}>
                  {selected.status === 'on_site' ? 'On site' : 'Departed'}
                </Chip>
                <Chip tone="info">{selected.type}</Chip>
                <span className="vis-detail-id num">{selected.id}</span>
              </div>
              <p className="vis-detail-meta muted">
                {selected.company} · {selected.plate} · {selected.yard}
              </p>
              <p className="vis-detail-times num">
                In {formatVisitorDate(selected.checkedIn)} {formatVisitorTime(selected.checkedIn)}
                {selected.checkedOut
                  ? ` · Out ${formatVisitorTime(selected.checkedOut)}`
                  : ' · Still on site'}
              </p>
            </div>

            <div className="vis-timeline card">
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
          <div className="vis-detail card vis-detail-empty">
            Select a visitor to view details.
          </div>
        )}
      </div>
    </section>
  )
}
