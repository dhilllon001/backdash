import { useMemo, useState } from 'react'
import { MapPin, Clock3 } from 'lucide-react'
import { Chip, formatClock } from '../../components/ui.jsx'
import { getSecurityPerson, getSecurityShifts } from '../../data/security.js'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'punches', label: 'Punches' },
  { id: 'location', label: 'Location' },
  { id: 'paycodes', label: 'Pay codes' },
]

export function SecurityPersonDetail({ personId, employee, onResolvePunch }) {
  const emp = employee || getSecurityPerson(personId) || getSecurityPerson('s1')
  const shifts = useMemo(() => getSecurityShifts(emp.id), [emp.id])
  const [tab, setTab] = useState('overview')
  const shift = shifts[0]

  const open = shift?.open
  const jobs = shift?.jobs || []

  return (
    <section className="sec-detail pd dash3">
      <div className="sec-detail-inner">
        <div className="pd-hero sec-detail-hero">
          <div className="pd-hero-top">
            <div className="pd-hero-title">
              <div className="sec-detail-person">
                <span
                  className="pav sec-detail-av"
                  style={{ background: emp.bg, color: emp.color }}
                >
                  {emp.initials}
                </span>
                <div>
                  <h2>{emp.name}</h2>
                  <div className="pd-hero-loc">
                    <MapPin size={13} strokeWidth={2.2} />
                    {emp.yards.join(' · ')} · {emp.role}
                  </div>
                </div>
              </div>
            </div>
            <div className="pd-hero-tags">
              <Chip tone={emp.status.tone}>{emp.status.label}</Chip>
              {emp.ot ? <Chip tone="warn">OT {emp.ot}</Chip> : null}
              {open ? (
                <button
                  type="button"
                  className="btn btn-sm btn-danger-soft"
                  onClick={() => onResolvePunch?.(emp.id)}
                >
                  Resolve punch
                </button>
              ) : null}
            </div>
          </div>

          <div className="pd-meta-strip">
            <div>
              <span>Clock in</span>
              <b>{shift?.in ? formatClock(shift.in) : '—'}</b>
            </div>
            <div>
              <span>Clock out</span>
              <b>{shift?.out ? formatClock(shift.out) : open ? 'Open' : '—'}</b>
            </div>
            <div>
              <span>Payable</span>
              <b className="num">{emp.payable}</b>
            </div>
            <div>
              <span>Task hrs</span>
              <b className="num">{emp.jobHrs}</b>
            </div>
            <div>
              <span>Utilization</span>
              <b className="num">{emp.util}%</b>
            </div>
          </div>
        </div>

        <div className="pd-tabs sec-detail-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'on' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sec-detail-body card">
          {tab === 'overview' && (
            <div className="sec-detail-overview">
              <div className="sec-detail-section-head">
                <h3>Tasks on shift</h3>
                <span className="muted">{shift?.day || 'Current shift'} · {shift?.yard}</span>
              </div>
              {jobs.length === 0 ? (
                <p className="sec-detail-empty">No tasks recorded for this shift.</p>
              ) : (
                <ul className="sec-task-list">
                  {jobs.map((j) => (
                    <li key={j.id} className="sec-task-item">
                      <div className="sec-task-main">
                        <span className="sec-task-id num">{j.id}</span>
                        <b>{j.title}</b>
                        <span className="muted">{j.unit}</span>
                      </div>
                      <div className="sec-task-meta num">
                        {formatClock(j.start)} → {j.end ? formatClock(j.end) : 'open'}
                      </div>
                      <Chip tone={j.status?.tone || 'muted'}>{j.status?.label || '—'}</Chip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'punches' && (
            <div className="sec-detail-punches">
              <div className="sec-detail-section-head">
                <h3>Punch ledger</h3>
                <Clock3 size={15} />
              </div>
              <table className="dash-table compact">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Yard</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr key={s.id} className="data">
                      <td>{s.day}</td>
                      <td>{s.yard}</td>
                      <td className="num">{formatClock(s.in)}</td>
                      <td className="num">{s.out ? formatClock(s.out) : '—'}</td>
                      <td>
                        <Chip tone={s.open ? 'warn' : 'ok'}>
                          {s.open ? 'Open punch' : 'Closed'}
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'location' && (
            <div className="sec-detail-location">
              <p className="muted">
                Last known yard: <b>{shift?.yard || emp.yards[0]}</b> · Gate check-in via badge
                scan.
              </p>
              <div className="sec-loc-placeholder">
                <MapPin size={28} strokeWidth={1.5} />
                <span>Yard map · {emp.yards[0]}</span>
              </div>
            </div>
          )}

          {tab === 'paycodes' && (
            <div className="sec-detail-paycodes">
              <div className="sec-pay-grid">
                <div className="sec-pay-cell">
                  <span>Regular</span>
                  <b className="num">{emp.reg}</b>
                </div>
                <div className="sec-pay-cell">
                  <span>Overtime</span>
                  <b className="num">{emp.ot || '—'}</b>
                </div>
                <div className="sec-pay-cell">
                  <span>Payable total</span>
                  <b className="num">{emp.payable}</b>
                </div>
                <div className="sec-pay-cell">
                  <span>Tasks completed</span>
                  <b className="num">{emp.jobs}</b>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
