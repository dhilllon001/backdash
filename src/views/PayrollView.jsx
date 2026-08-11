import { useMemo, useState } from 'react'
import { ChevronRight, Calendar, Search } from 'lucide-react'
import { Chip, Kpi } from '../components/ui.jsx'
import { EMPLOYEES } from '../data/mock.js'

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

export function PayrollView({ location, search, onOpenPerson, onOpenExceptions }) {
  const [localSearch, setLocalSearch] = useState('')
  const q = search || localSearch
  const rows = useMemo(
    () => EMPLOYEES.filter((e) => matchesFilter(e, location, q)),
    [location, q],
  )
  const ontario = rows.filter((e) => e.region === 'ontario')
  const texas = rows.filter((e) => e.region === 'texas')
  const blocked = EMPLOYEES.filter((e) => !e.canApprove && e.status.tone === 'dang').length

  const renderGroup = (label, people, sub) => (
    <>
      <tr className="grp">
        <td colSpan={9}>{label} <span className="gm">{sub}</span></td>
      </tr>
      {people.map((emp) => (
        <tr
          key={emp.id}
          className="data"
          onClick={() => onOpenPerson(emp.id)}
        >
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
            {emp.reg}
            {emp.ot ? <span className="ot-badge">OT {emp.ot}</span> : null}
          </td>
          <td className="num">{emp.jobHrs}</td>
          <td>
            <div className="util-cell">
              <div className="util-bar">
                <i
                  style={{
                    width: `${emp.util}%`,
                    background: emp.util < 50 ? 'var(--warning)' : undefined,
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: 12 }}>
                {emp.util}%
              </span>
            </div>
          </td>
          <td className="num">{emp.jobs}</td>
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Chip tone={emp.status.tone}>{emp.status.label}</Chip>
              {emp.approvedBy ? (
                <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 500 }}>
                  {emp.approvedBy}
                </span>
              ) : null}
            </div>
          </td>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={`btn btn-sm${emp.canApprove ? ' btn-primary' : ''}`}
                disabled={!emp.canApprove}
                onClick={(e) => e.stopPropagation()}
              >
                Approve
              </button>
              <span className="caret">
                <ChevronRight size={14} strokeWidth={2.4} />
              </span>
            </div>
          </td>
        </tr>
      ))}
      {people.length > 0 && (
        <tr className="sub">
          <td colSpan={2} className="t-lab">
            {label.split('·')[0].trim()} · {people.length} people
          </td>
          <td className="num">
            {people === ontario ? '239:45' : '118:57'}
          </td>
          <td className="num">{people === ontario ? '225:40 / 14:05' : '118:57 / 0:00'}</td>
          <td className="num">{people === ontario ? '180:19' : '84:07'}</td>
          <td className="num">{people === ontario ? '75%' : '71%'}</td>
          <td className="num">{people === ontario ? '19/28' : '4/5'}</td>
          <td colSpan={2} />
        </tr>
      )}
    </>
  )

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Labour & Payroll</h1>
          <div className="page-sub">
            Hours and job time per person for this pay period. Open a row to review the shift ledger,
            then approve.
          </div>
        </div>
        <div className="page-actions">
          <span className="period-badge">
            <Calendar size={12} strokeWidth={2.4} /> Jul 7 – Jul 20 · cutoff in 2d
          </span>
        </div>
      </div>

      <div className="alert-banner" onClick={onOpenExceptions} role="button" tabIndex={0}>
        <span className="alert-count">4</span>
        <div className="alert-text">
          <b>blocking exceptions</b> are holding 3 timesheets — open punch, missed punch-outs,
          geofence mismatch
        </div>
        <span className="alert-link">Review exceptions →</span>
      </div>

      <div className="filter-bar">
        <div className="search">
          <Search size={14} strokeWidth={2.2} />
          <input
            type="search"
            placeholder="Search employee…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <span className="k kbd">/</span>
        </div>
        <button type="button" className="fchip">
          Yard: <b>{location === 'all' ? 'All' : location}</b>
        </button>
        <button type="button" className="fchip">
          Status: <b>All</b>
        </button>
      </div>

      <div className="kpis four">
        <Kpi label="On shift now" value="3" unit="of 6" sub="Brampton 2 · Laredo 1" />
        <Kpi label="Payable hours" value="358" unit="h 42m" sub="Breaks already deducted" />
        <Kpi label="Overtime" value="14" unit="h 05m" sub="2 people over threshold" />
        <Kpi
          label="Approved"
          value="2"
          unit="of 6"
          sub={`${blocked} blocked · 1 pending`}
        />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Yards</th>
              <th className="num">Payable</th>
              <th className="num">Reg / OT</th>
              <th className="num">Job hrs</th>
              <th className="num">Util</th>
              <th className="num">Jobs</th>
              <th>Status</th>
              <th style={{ width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {ontario.length > 0 &&
              renderGroup('Ontario · CAD', ontario, 'overtime after 44 h/week · EDT')}
            {texas.length > 0 &&
              renderGroup('Texas · USD', texas, 'overtime after 40 h/week · CDT')}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>6 people</td>
              <td className="num">358:42</td>
              <td className="num">344:37 / 14:05</td>
              <td className="num">264:26</td>
              <td className="num">73%</td>
              <td className="num">23/33</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
