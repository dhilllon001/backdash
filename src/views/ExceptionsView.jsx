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
      <div className="page-head">
        <div>
          <h1 className="h1">Exceptions</h1>
          <div className="page-sub">
            Everything that has to be fixed before a timesheet can be approved. Clear the blocking
            list first.
          </div>
        </div>
      </div>

      <div className="svtabs" style={{ marginBottom: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`svtab${tab === t.id ? ' on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}{' '}
            <span className={`cnt${t.id === 'blocking' ? ' dang' : t.id === 'review' ? ' warn' : ''}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'blocking' && (
          <div className="section-label dang">Blocking</div>
        )}
        {tab === 'review' && (
          <div className="section-label warn">Needs review — does not block approval</div>
        )}
        {tab === 'resolved' && <div className="section-label">Resolved</div>}

        <table>
          <thead>
            <tr>
              <th>Exception</th>
              <th>Employee</th>
              <th>Day</th>
              <th>What happened</th>
              <th className="num">Hours at risk</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ex) => (
              <tr key={ex.id} className="data" style={{ cursor: 'default' }}>
                <td>
                  <Chip tone={ex.severity}>{ex.type}</Chip>
                </td>
                <td>
                  <div className="person">
                    <div className="pav" style={{ background: ex.bg, color: ex.color }}>
                      {ex.initials}
                    </div>
                    <div className="cell-2l">
                      <span className="p">{ex.person}</span>
                      <span className="s">{ex.empId}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-2l">
                    <span className="p" style={{ fontWeight: 600 }}>
                      {ex.day}
                    </span>
                    <span className="s">
                      {ex.dayNote || ex.location}
                    </span>
                  </div>
                </td>
                <td style={{ whiteSpace: 'normal', maxWidth: 360, fontWeight: 500 }}>
                  {ex.detail}
                </td>
                <td className="num" style={{ fontWeight: 700 }}>
                  {ex.hoursAtRisk}
                </td>
                <td>
                  {ex.action ? (
                    <button
                      type="button"
                      className={`btn btn-sm${ex.action === 'punch' ? ' btn-primary' : ''}`}
                      onClick={() => onAction?.(ex)}
                    >
                      {ex.actionLabel}
                    </button>
                  ) : (
                    <button type="button" className="btn btn-sm btn-ghost">
                      {ex.actionLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--text-3)' }}>
                  No exceptions in this tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tbl-foot">
          <span className="rc">
            {counts.blocking} blocking · {counts.review} to review · every fix is written to the
            audit trail with a reason code.
          </span>
        </div>
      </div>
    </section>
  )
}
