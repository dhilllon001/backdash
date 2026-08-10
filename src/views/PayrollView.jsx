import { Fragment, useState } from 'react'
import { ChevronRight, Lock, Calendar } from 'lucide-react'
import { Chip, Kpi } from '../components/ui.jsx'
import { EMPLOYEES, SHIFTS_AV } from '../data/mock.js'

function matchesFilter(emp, location, search) {
  const q = search.trim().toLowerCase()
  const locOk = location === 'all' || emp.yards.some((y) => y === location)
  const searchOk =
    !q ||
    emp.name.toLowerCase().includes(q) ||
    emp.role.toLowerCase().includes(q) ||
    emp.yards.some((y) => y.toLowerCase().includes(q))
  return locOk && searchOk
}

function ShiftTimeline({ shifts }) {
  return (
    <div className="ledger">
      <div className="shift-head">
        <div />
        <div className="rail-scale">
          {['05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="rail-scale" style={{ justifyContent: 'flex-end', color: 'var(--text-4)' }}>
          <span>In · out · hours</span>
        </div>
      </div>
      {shifts.map((s) => (
        <div className="shift-day" key={s.day}>
          <div className="sd-date cell-2l">
            <span className="p">{s.day}</span>
            <span className="s">{s.yard}</span>
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
            <span className="io">{s.meta.in}</span>
            <span className="src">{s.meta.src}</span>
            <span style={{ color: 'var(--text-4)' }}>→</span>
            {s.meta.open ? (
              <Chip tone="dang" xs>
                still open
              </Chip>
            ) : (
              <>
                <span className="io">{s.meta.out}</span>
                {s.meta.note ? (
                  <span style={{ color: 'var(--text-3)' }}>{s.meta.note}</span>
                ) : null}
              </>
            )}
          </div>
        </div>
      ))}
      <div className="rail-legend">
        <span>
          <i className="ls" />
          Scheduled
        </span>
        <span>
          <i className="lw" />
          Clocked in
        </span>
        <span>
          <i className="lj" />
          On a job
        </span>
        <span>
          <i className="lb" />
          Break
        </span>
        <span>
          <i className="lo" />
          Open punch
        </span>
      </div>
    </div>
  )
}

function EmployeeDetail({ emp, onResolvePunch }) {
  if (emp.id !== 'd1') {
    return (
      <tr className="detail-row">
        <td colSpan={12}>
          <div className="detail-wrap">
            <div className="detail-pane" style={{ gridColumn: '1 / -1' }}>
              <div className="hint">
                Expand detail for {emp.name}. Full shift ledger and pay codes are available in the
                live payroll period view.
              </div>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="detail-row">
      <td colSpan={12}>
        <div className="detail-wrap">
          <div className="detail-pane">
            <div className="dsec-title">
              Shift timeline
              <Chip tone="ok" xs>
                Verified
              </Chip>
              <Chip tone="dang" xs>
                Open punch
              </Chip>
            </div>
            <ShiftTimeline shifts={SHIFTS_AV} />
            <div className="note warn" style={{ marginTop: 12 }}>
              Jul 18 — 8h 55m worked with no break punch. Record the break or attest before
              approving.
            </div>
          </div>
          <div className="detail-pane">
            <div className="dsec-title">Pay code breakdown</div>
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
                    <td className="num">70:12</td>
                    <td className="num">2,000.70</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="code">OT1</span> Overtime
                    </td>
                    <td className="num">8:00</td>
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
                    <td className="num">78:12</td>
                    <td className="num">
                      2,342.70 <span className="ccy">cad</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="detail-actions">
            <button type="button" className="btn btn-sm btn-danger-soft" onClick={onResolvePunch}>
              Resolve open punch
            </button>
            <button type="button" className="btn btn-sm">
              Add missed punch
            </button>
            <button type="button" className="btn btn-sm">
              Record break
            </button>
            <div className="spacer" />
            <button type="button" className="btn btn-sm" disabled>
              Approve — 2 blockers
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

export function PayrollView({ location, search, onResolvePunch, onOpenExceptions }) {
  const [openId, setOpenId] = useState('d1')
  const [tab, setTab] = useState('all')
  const rows = EMPLOYEES.filter((e) => matchesFilter(e, location, search))

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Labour & Payroll</h1>
          <div className="page-sub">Review punches, clear exceptions, and approve timesheets.</div>
        </div>
        <div className="page-actions">
          <span className="lock-badge">
            <Lock size={12} strokeWidth={2.4} /> Period open
          </span>
          <span className="period-badge">
            <Calendar size={12} strokeWidth={2.4} /> Pay period{' '}
            <span className="mono">Jul 7 – Jul 20</span>
          </span>
          <button type="button" className="btn btn-primary" disabled>
            Approve & export · 4 blockers
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <button type="button" className="fchip set">
          Pay period: <b>Jul 7 – Jul 20, 2026</b>
        </button>
        <button type="button" className="fchip">
          Crew: <b>All ({rows.length})</b>
        </button>
        <button type="button" className="fchip set">
          Employment: <b>Employee</b>
        </button>
      </div>

      <div className="kpis">
        <Kpi label="On shift now" value="3" unit="of 6" sub="Brampton 2 · Laredo 1" />
        <Kpi
          label="Payable hours"
          value="318"
          unit="h 42m"
          sub={
            <>
              <span className="delta up">▲ 6.2%</span> vs prior
            </>
          }
        />
        <Kpi label="Overtime" value="14" unit="h 05m" sub="2 of 6 over threshold" />
        <Kpi
          label="Unpaid break"
          value="7"
          unit="h 30m"
          sub={
            <>
              1 missed eating period <span className="delta down">▼ ESA</span>
            </>
          }
        />
        <Kpi label="Jobs completed" value="21" unit="of 31" sub="6 in progress · 2 rework" />
        <Kpi label="Job-time utilization" value="73" unit="%" sub="232h 14m on jobs" />
      </div>

      <div className="exc-strip">
        <span className="exc-lab">Quick</span>
        <button type="button" className="exc dang" onClick={onOpenExceptions}>
          Open punch <span className="n">1</span>
        </button>
        <button type="button" className="exc dang" onClick={onOpenExceptions}>
          Missed punch-out <span className="n">2</span>
        </button>
        <button type="button" className="exc dang" onClick={onOpenExceptions}>
          Geofence <span className="n">1</span>
        </button>
        <button type="button" className="exc warn" onClick={onOpenExceptions}>
          Review queue <span className="n">7</span>
        </button>
        <button type="button" className="btn btn-sm" onClick={onOpenExceptions}>
          View all exceptions
        </button>
      </div>

      <div className="card">
        <div className="svtabs" style={{ padding: '0 10px' }}>
          {[
            ['all', 'All crew', rows.length],
            ['blocked', 'Blocked', 3, 'dang'],
            ['pending', 'Awaiting approval', 3, 'warn'],
            ['ready', 'Ready to export', 2],
          ].map(([id, label, count, tone]) => (
            <button
              key={id}
              type="button"
              className={`svtab${tab === id ? ' on' : ''}`}
              onClick={() => setTab(id)}
            >
              {label} <span className={`cnt${tone ? ` ${tone}` : ''}`}>{count}</span>
            </button>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }} />
              <th>Employee</th>
              <th>Yards</th>
              <th className="num">Payable</th>
              <th className="num">Reg / OT</th>
              <th className="num">Job hrs</th>
              <th className="num">Util</th>
              <th className="num">Jobs</th>
              <th className="num">Est. gross</th>
              <th>Exceptions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => {
              const open = openId === emp.id
              return (
                <Fragment key={emp.id}>
                  <tr
                    className={`data${open ? ' open-row' : ''}`}
                    onClick={() => setOpenId(open ? null : emp.id)}
                  >
                    <td>
                      <span className="caret">
                        <ChevronRight size={12} strokeWidth={2.6} />
                      </span>
                    </td>
                    <td>
                      <div className="person">
                        <div className="pav" style={{ background: emp.bg, color: emp.color }}>
                          {emp.initials}
                        </div>
                        <div className="cell-2l">
                          <span className="p">{emp.name}</span>
                          <span className="s">{emp.role}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="yard-chips">
                        {emp.yards.map((y) => (
                          <Chip key={y} tone="neutral" xs>
                            {y}
                          </Chip>
                        ))}
                      </div>
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>
                      {emp.payable}
                    </td>
                    <td className="num">
                      {emp.regOt}
                      {emp.ot ? <span className="ot-badge">OT {emp.ot}</span> : null}
                    </td>
                    <td className="num">{emp.jobHrs}</td>
                    <td>
                      <div className="util-cell">
                        <div className="util-bar">
                          <i style={{ width: `${emp.util}%` }} />
                        </div>
                        <span className="mono" style={{ fontSize: 12 }}>
                          {emp.util}%
                        </span>
                      </div>
                    </td>
                    <td className="num">{emp.jobs}</td>
                    <td className="num">
                      {emp.gross}
                      <span className="ccy">{emp.ccy}</span>
                    </td>
                    <td>
                      {emp.exception ? (
                        <Chip tone={emp.exception.tone}>{emp.exception.label}</Chip>
                      ) : (
                        <span style={{ color: 'var(--text-4)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <Chip tone={emp.status.tone}>{emp.status.label}</Chip>
                    </td>
                  </tr>
                  {open ? (
                    <EmployeeDetail emp={emp} onResolvePunch={onResolvePunch} />
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td />
              <td>All crew · {rows.length} employees</td>
              <td />
              <td className="num">358:42</td>
              <td className="num">344:37 / 14:05</td>
              <td className="num">264:26</td>
              <td className="num">73%</td>
              <td className="num">23/33</td>
              <td className="num">9,668.82</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
        <div className="tbl-foot">
          <span className="rc">{rows.length} employees shown</span>
        </div>
      </div>
    </section>
  )
}
