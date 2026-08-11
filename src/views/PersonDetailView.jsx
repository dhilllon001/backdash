import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Chip } from '../components/ui.jsx'
import { getEmployee, getPersonShifts } from '../data/mock.js'

function PhotoThumbs({ photos, labels }) {
  return (
    <div className="photo-thumbs">
      {(photos || []).map((color, i) => (
        <div key={i} className="photo-thumb" style={{ background: color }}>
          {labels?.[i] ? <span>{labels[i]}</span> : null}
        </div>
      ))}
    </div>
  )
}

export function PersonDetailView({ personId, onBack, onResolvePunch, onOpenExceptions }) {
  const emp = getEmployee(personId) || getEmployee('d1')
  const shifts = getPersonShifts(emp.id)
  const [selectedId, setSelectedId] = useState(shifts[0]?.id)
  const [rightTab, setRightTab] = useState('jobs')
  const selected = shifts.find((s) => s.id === selectedId) || shifts[0]

  const chartMax = useMemo(() => {
    const vals = shifts.map((s) => {
      if (s.open) return 9
      const [h, m] = (s.payable || '0:00').split(':').map(Number)
      return h + m / 60
    })
    return Math.max(...vals, 1)
  }, [shifts])

  return (
    <section className="person-page">
      <div className="person-hero card">
        <button type="button" className="btn btn-sm btn-ghost back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="person-hero-main">
          <div className="person">
            <div className="pav lg" style={{ background: emp.bg, color: emp.color }}>
              {emp.initials}
            </div>
            <div className="cell-2l">
              <span className="p" style={{ fontSize: 18 }}>
                {emp.name}
              </span>
              <span className="s">
                {emp.role} · {emp.yards.join(', ')} · Jul 7 – Jul 20
              </span>
            </div>
          </div>
          <div className="person-metrics">
            <div>
              <div className="pm-label">Payable</div>
              <div className="pm-val">{emp.payable}</div>
            </div>
            <div>
              <div className="pm-label">Reg</div>
              <div className="pm-val">{emp.reg}</div>
            </div>
            <div>
              <div className="pm-label">OT</div>
              <div className="pm-val" style={{ color: emp.ot ? 'var(--warning)' : undefined }}>
                {emp.ot || '0:00'}
              </div>
            </div>
            <div>
              <div className="pm-label">On jobs</div>
              <div className="pm-val">{emp.jobHrs}</div>
            </div>
            <div>
              <div className="pm-label">Util</div>
              <div className="pm-val">{emp.util}%</div>
            </div>
          </div>
          <div className="person-hero-actions">
            {emp.status.tone === 'dang' ? (
              <button type="button" className="btn btn-sm btn-danger-soft" onClick={onResolvePunch}>
                <i className="dot" /> Open punch
              </button>
            ) : null}
            <button type="button" className="btn btn-sm" disabled={!emp.canApprove}>
              Approve
            </button>
          </div>
        </div>
      </div>

      <div className="person-grid">
        <div className="person-left">
          <div className="card">
            <div className="card-head">
              <div className="h3">Shift ledger</div>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                Pick a day to see its jobs
              </span>
            </div>
            <div className="ledger person-ledger">
              <div className="shift-head">
                <div />
                <div className="rail-scale">
                  {['05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div />
              </div>
              {shifts.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={`shift-day clickable${selectedId === s.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="sd-date cell-2l">
                    <span className="p">{s.day}</span>
                    <span className="s">
                      {s.yard} · {s.tz}
                    </span>
                  </div>
                  <div className="rail">
                    {s.segs.map((seg, i) =>
                      seg.type === 'sched' ? (
                        <span key={i} className="sched" style={{ left: seg.left, width: seg.width }} />
                      ) : (
                        <span
                          key={i}
                          className={`seg ${seg.type}`}
                          style={{ left: seg.left, width: seg.width }}
                        />
                      ),
                    )}
                    {[16.6, 33.3, 50, 66.6, 83.3].map((left) => (
                      <span key={left} className="tick" style={{ left: `${left}%` }} />
                    ))}
                  </div>
                  <div className="sd-meta">
                    <span className="io">{s.in}</span>
                    <span style={{ color: 'var(--text-4)' }}>→</span>
                    {s.open ? (
                      <Chip tone="dang" xs>
                        still open
                      </Chip>
                    ) : (
                      <>
                        <span className="io">{s.out}</span>
                        <span style={{ color: 'var(--text-3)' }}>{s.hoursLabel}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
              <div className="rail-legend">
                <span>
                  <i className="ls" /> Scheduled
                </span>
                <span>
                  <i className="lw" /> Clocked in
                </span>
                <span>
                  <i className="lj" /> On a job
                </span>
                <span>
                  <i className="lb" /> Break
                </span>
                <span>
                  <i className="lo" /> Open punch
                </span>
              </div>
            </div>
            <div className="ledger-foot">
              <span>9 days worked · {emp.payable} payable · {emp.jobHrs} on jobs</span>
              <button type="button" className="text-link" onClick={onOpenExceptions}>
                2 exceptions on this timesheet →
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-head">
              <div className="h3">Payable hours by day</div>
            </div>
            <div className="hours-chart">
              {shifts.map((s) => {
                const hours = s.open
                  ? 9
                  : (() => {
                      const [h, m] = (s.payable || '0:00').split(':').map(Number)
                      return h + m / 60
                    })()
                const height = `${Math.max(12, (hours / chartMax) * 100)}%`
                return (
                  <button
                    type="button"
                    key={s.id}
                    className={`chart-col${selectedId === s.id ? ' on' : ''}`}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <span className="chart-val">{s.open ? 'open' : s.payable}</span>
                    <span
                      className={`chart-bar ${s.barTone}`}
                      style={{ height }}
                    />
                    <span className="chart-day">{s.short}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="person-right card">
          <div className="svtabs" style={{ padding: '0 12px' }}>
            <button
              type="button"
              className={`svtab${rightTab === 'jobs' ? ' on' : ''}`}
              onClick={() => setRightTab('jobs')}
            >
              Jobs & photos
            </button>
            <button
              type="button"
              className={`svtab${rightTab === 'pay' ? ' on' : ''}`}
              onClick={() => setRightTab('pay')}
            >
              Pay codes
            </button>
          </div>

          {rightTab === 'jobs' ? (
            <div className="day-panel">
              <div className="day-panel-head">
                <div className="h3" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  {selected.day}
                </div>
                <div className="page-sub" style={{ marginTop: 2 }}>
                  {selected.yard} · {selected.in} → {selected.open ? 'still open' : selected.out} ·{' '}
                  {selected.jobCount} jobs · {selected.onJobs} on jobs
                </div>
              </div>

              <div className="day-timeline">
                <div className="day-event">
                  <div className="de-dot" />
                  <div>
                    <b>{selected.in}</b> Clocked in · {selected.yard}
                    <span className="src" style={{ marginLeft: 6 }}>
                      app
                    </span>
                  </div>
                </div>

                {(selected.jobs || []).map((job) => (
                  <div className="day-job" key={job.id}>
                    <div className="de-dot job" />
                    <div className="day-job-card">
                      <div className="day-job-top">
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {job.title} · {job.unit}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
                            {job.id}
                          </div>
                        </div>
                        <Chip tone={job.status.tone} xs>
                          {job.status.label}
                        </Chip>
                      </div>
                      <div className="day-job-meta">
                        <span>
                          <b style={job.over ? { color: 'var(--danger)' } : undefined}>
                            {job.actual}
                          </b>{' '}
                          <span style={{ color: 'var(--text-4)' }}>est {job.est}</span>
                        </span>
                        <span>checklist {job.checklist}</span>
                      </div>
                      <div
                        className="job-progress"
                        style={{
                          background: job.over ? 'var(--danger)' : 'var(--accent)',
                          width: job.over ? '100%' : '72%',
                        }}
                      />
                      <PhotoThumbs photos={job.photos} />
                    </div>
                  </div>
                ))}

                {selected.exception ? (
                  <div className="day-exception">
                    <span className="de-alert" />
                    <div>
                      <b>{selected.exception.time}</b> {selected.exception.text}{' '}
                      <button type="button" className="text-link dang" onClick={onResolvePunch}>
                        [resolve]
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="day-panel">
              <div className="pay-tbl">
                <table>
                  <thead>
                    <tr>
                      <th>Pay code</th>
                      <th className="num">Hours</th>
                      <th className="num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="code">REG</span> Regular
                      </td>
                      <td className="num">{emp.reg}</td>
                      <td className="num">2,000.70</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="code">OT1</span> Overtime
                      </td>
                      <td className="num">{emp.ot || '0:00'}</td>
                      <td className="num">342.00</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="code">BRK</span> Unpaid break
                      </td>
                      <td className="num">(2:00)</td>
                      <td className="num">—</td>
                    </tr>
                    <tr className="tot">
                      <td>Estimated gross</td>
                      <td className="num">{emp.payable}</td>
                      <td className="num">
                        {emp.gross} <span className="ccy">{emp.ccy}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
