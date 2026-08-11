import { useMemo, useState } from 'react'
import { Chip } from '../components/ui.jsx'
import { EXCEPTIONS } from '../data/mock.js'

const TABS = [
  { id: 'blocking', label: 'Blocking' },
  { id: 'review', label: 'Needs review' },
  { id: 'resolved', label: 'Resolved' },
]

export function ExceptionsView({ location, search, onAction }) {
  const [tab, setTab] = useState('blocking')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EXCEPTIONS.filter((ex) => {
      if (ex.status !== tab) return false
      const locOk = location === 'all' || ex.location === location
      const searchOk =
        !q ||
        ex.person.toLowerCase().includes(q) ||
        ex.type.toLowerCase().includes(q) ||
        ex.detail.toLowerCase().includes(q)
      return locOk && searchOk
    })
  }, [tab, location, search])

  const counts = useMemo(
    () => ({
      blocking: EXCEPTIONS.filter((e) => e.status === 'blocking').length,
      review: EXCEPTIONS.filter((e) => e.status === 'review').length,
      resolved: EXCEPTIONS.filter((e) => e.status === 'resolved').length,
    }),
    [],
  )

  return (
    <section>
      <div className="tabs-card">
        <div className="svtabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`svtab${tab === t.id ? ' on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}{' '}
              <span
                className={`cnt${t.id === 'blocking' ? ' dang' : t.id === 'review' ? ' warn' : ''}`}
              >
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Exception</th>
              <th>Employee</th>
              <th>Day</th>
              <th>What happened</th>
              <th>Location</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ex) => (
              <tr key={ex.id} className="data">
                <td>
                  <div className="cell-2l">
                    <span className="p">{ex.type}</span>
                    <span className="s">{ex.id}</span>
                  </div>
                </td>
                <td>{ex.person}</td>
                <td>{ex.day}</td>
                <td style={{ maxWidth: 320 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 }}>
                    {ex.detail}
                  </span>
                </td>
                <td>
                  <Chip tone="neutral" xs>
                    {ex.location}
                  </Chip>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onAction?.(ex)}
                  >
                    {ex.actionLabel || 'Resolve'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--text-3)' }}>
                  Nothing in this list.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
