import { useMemo, useState } from 'react'
import { Search, ChevronRight, AlertTriangle, Info } from 'lucide-react'
import { SECURITY_PEOPLE, SEC_REPORT_SHIFTS } from '../../data/security.js'

const W0 = 6 * 60
const W1 = 18 * 60
const WD = W1 - W0

function parseHours(h) {
  if (!h || h === '—') return 0
  const [hh, mm] = String(h).split(':').map(Number)
  return (hh || 0) * 60 + (mm || 0)
}

function formatMinutes(min) {
  if (min == null || Number.isNaN(min) || min < 0) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(t) {
  if (!t || t === '—') return null
  const [hh, mm] = String(t).split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  return hh * 60 + mm
}

function pos(m) {
  return ((Math.min(Math.max(m, W0), W1) - W0) / WD) * 100
}

function empMeta(personId) {
  const emp = SECURITY_PEOPLE.find((e) => e.id === personId)
  if (!emp) {
    return {
      name: 'Unknown',
      role: 'Guard',
      initials: '??',
      color: '#2B4FD3',
      bg: '#EEF1FD',
      empId: personId,
    }
  }
  return {
    name: emp.name,
    role: emp.role,
    initials: emp.initials,
    color: emp.color,
    bg: emp.bg,
    empId: emp.role?.match(/SEC-\d+/)?.[0] || emp.id,
  }
}

function jobBlockClass(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('verified') || s.includes('complete')) return 'c'
  if (s.includes('progress')) return 'p'
  return 'v'
}

function enrichShift(row) {
  const meta = empMeta(row.personId)
  const hoursMin = row.hours && row.hours !== '—' ? parseHours(row.hours) : null
  const prodMin = parseHours(row.productiveHours)
  const jobs = (row.jobs || []).map((j) => ({
    ...j,
    startMin: j.startMin ?? timeToMinutes(j.start) ?? W0,
    endMin: j.endMin ?? timeToMinutes(j.end) ?? W1,
  }))
  return {
    ...row,
    meta,
    hoursMin,
    prodMin,
    jobs,
    flagged: !!row.alerts?.length,
  }
}

function SecTimeline({ day, setTip }) {
  const hours = []
  for (let h = 6; h <= 18; h += 2) hours.push(h)
  const end = day.shiftEnd && day.shiftEnd !== '—' ? timeToMinutes(day.shiftEnd) : W1
  const start = timeToMinutes(day.shiftStart) || W0

  return (
    <div className="rp-tl">
      <div className="rp-tl-scale" aria-hidden="true">
        {hours.map((h) => (
          <span key={h} className="rp-tl-hour" style={{ left: `${pos(h * 60)}%` }}>
            {h}
          </span>
        ))}
      </div>
      <div className="rp-tl-body">
        <div className="track2" />
        {hours.map((h) => (
          <div key={`t-${h}`} className="tick" style={{ left: `${pos(h * 60)}%` }} />
        ))}
        <div
          className="span"
          style={{ left: `${pos(start)}%`, width: `${Math.max(pos(end) - pos(start), 0.5)}%` }}
        />
        {!day.shiftEnd || day.shiftEnd === '—' ? (
          <>
            <div
              className="open-end"
              style={{ left: `${pos(start)}%`, width: `${100 - pos(start)}%` }}
            />
            <div className="cap" style={{ left: `${pos(start)}%` }} />
          </>
        ) : null}
        {day.jobs.map((j) => {
          const leftPct = j.left ?? pos(j.startMin)
          const widthPct = j.width ?? Math.max(pos(j.endMin) - pos(j.startMin), 0.7)
          const showLabel = widthPct >= 8
          return (
            <div
              key={j.id}
              className={`blk ${jobBlockClass(j.status)}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onMouseEnter={(e) => {
                e.stopPropagation()
                setTip({
                  x: e.clientX + 12,
                  y: e.clientY + 14,
                  title: `${j.id} · ${j.title}`,
                  line1: `${j.unit} · ${j.status}`,
                  line2: j.hours || '',
                })
              }}
              onMouseMove={(e) => {
                e.stopPropagation()
                setTip((t) => (t ? { ...t, x: e.clientX + 12, y: e.clientY + 14 } : t))
              }}
              onMouseLeave={() => setTip(null)}
            >
              {showLabel ? <span className="blk-lab num">{j.hours}</span> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ShiftRow({ day, open, onToggle, setTip }) {
  return (
    <div className={`rp-dayrow${open ? ' open' : ''}${day.flagged ? ' flag' : ''}`}>
      <button type="button" className="rp-dline" onClick={onToggle} aria-expanded={open}>
        <ChevronRight className="rp-chev" size={16} strokeWidth={2} />
        <span className="rp-date">
          {day.meta.name}
          <small>{day.dateLabel}</small>
        </span>
        <span className="rp-shift num">
          {day.shiftStart} →{' '}
          {day.shiftEnd && day.shiftEnd !== '—' ? (
            day.shiftEnd
          ) : (
            <span className="miss">no punch-out</span>
          )}
        </span>
        <SecTimeline day={day} setTip={setTip} />
        <span className="rp-hrs num">
          {day.hoursMin != null ? formatMinutes(day.hoursMin) : day.hours}
        </span>
        <span className="rp-prod num h-prod">{formatMinutes(day.prodMin)}</span>
        <span className="rp-ot num h-ot">—</span>
        <span className="rp-jobs num h-jobs">{day.jobs.length}</span>
        <span className="h-status">
          {day.flagged ? (
            <span className="rp-badge warn">
              <AlertTriangle size={11} strokeWidth={2} />
              {day.alerts[0]}
            </span>
          ) : (
            <span className="rp-badge ok">Approved</span>
          )}
        </span>
      </button>
      {open ? (
        <div className="rp-detail">
          {day.jobs.map((j) => (
            <div key={j.id} className="rp-job">
              <div className="rp-jhead">
                <span className="rp-jid num">{j.id}</span>
                <span className="rp-jname">{j.title}</span>
                <span className="rp-junit num">{j.unit}</span>
                <span className="rp-badge ok">{j.status}</span>
                <span className="rp-jdur num">{j.hours}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function SecurityReportingView() {
  const [personId, setPersonId] = useState('all')
  const [start, setStart] = useState('2026-07-07')
  const [end, setEnd] = useState('2026-07-20')
  const [query, setQuery] = useState('')
  const [openDays, setOpenDays] = useState(() => new Set())
  const [tip, setTip] = useState(null)

  const rows = useMemo(() => {
    return SEC_REPORT_SHIFTS.filter((r) => {
      if (personId !== 'all' && r.personId !== personId) return false
      if (r.date < start || r.date > end) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      const meta = empMeta(r.personId)
      const hay = `${meta.name} ${r.dateLabel} ${r.jobs.map((j) => `${j.id} ${j.title}`).join(' ')}`.toLowerCase()
      return hay.includes(q)
    }).map(enrichShift)
  }, [personId, start, end, query])

  const groups = useMemo(() => {
    const map = new Map()
    rows.forEach((day) => {
      const key = day.personId
      if (!map.has(key)) {
        map.set(key, {
          key,
          meta: day.meta,
          title: day.meta.name,
          days: [],
          hoursMin: 0,
          prodMin: 0,
          jobs: 0,
          alerts: 0,
        })
      }
      const g = map.get(key)
      g.days.push(day)
      g.hoursMin += day.hoursMin || 0
      g.prodMin += day.prodMin || 0
      g.jobs += day.jobs.length
      if (day.flagged) g.alerts += 1
    })
    return [...map.values()].map((g) => ({
      ...g,
      hours: formatMinutes(g.hoursMin),
      productive: formatMinutes(g.prodMin),
      shifts: g.days.length,
    }))
  }, [rows])

  const [openGroups, setOpenGroups] = useState(() => new Set())

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleDay = (id) => {
    setOpenDays((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totals = useMemo(() => {
    const h = rows.reduce((n, d) => n + (d.hoursMin || 0), 0)
    const p = rows.reduce((n, d) => n + d.prodMin, 0)
    const j = rows.reduce((n, d) => n + d.jobs.length, 0)
    const flagged = rows.filter((d) => d.flagged).length
    return { h, p, j, flagged, util: h ? Math.round((p / h) * 1000) / 10 : 0, people: groups.length }
  }, [rows, groups.length])

  return (
    <section className="rp page">
      <div className="rp-wrap rp-full">
        <div className="rp-kpis">
          <div className="rp-kpi">
            <div className="lab">Hours logged</div>
            <div className="val num">{formatMinutes(totals.h)}</div>
            <div className="meta">across {totals.people} guards</div>
          </div>
          <div className="rp-kpi">
            <div className="lab">Task time</div>
            <div className="val num">{formatMinutes(totals.p)}</div>
            <div className="meta">booked to tasks</div>
          </div>
          <div className="rp-kpi">
            <div className="lab">Tasks</div>
            <div className="val num">{totals.j}</div>
            <div className="meta">completed / in progress</div>
          </div>
          <div className="rp-kpi">
            <div className="lab">Utilisation</div>
            <div className="val num">
              {totals.util}
              <small>%</small>
            </div>
            <div className="rp-meter">
              <i style={{ width: `${Math.min(totals.util, 100)}%` }} />
            </div>
          </div>
          <div className="rp-kpi">
            <div className="lab">Needs attention</div>
            <div className="val num">{totals.flagged}</div>
            <div className={`meta${totals.flagged ? ' warn' : ''}`}>
              {totals.flagged ? 'Flagged punch issues' : 'All clear'}
            </div>
          </div>
        </div>

        <div className="rp-toolbar">
          <label className="rp-field">
            <span>Guard</span>
            <select value={personId} onChange={(e) => setPersonId(e.target.value)}>
              <option value="all">All guards</option>
              {SECURITY_PEOPLE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="rp-date-field">
            <span>From</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="rp-date-field">
            <span>To</span>
            <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <label className="rp-search rp-search-lg">
            <Search size={15} strokeWidth={2} />
            <input
              type="search"
              placeholder="Search guard, task ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="rp-spacer" />
          <div className="rp-legend">
            <span>
              <i className="rp-sw v" />
              Task
            </span>
            <span>
              <i className="rp-sw c" />
              Complete
            </span>
            <span>
              <i className="rp-sw p" />
              Open
            </span>
          </div>
        </div>

        <div className="rp-card rp-scroll-card">
          <div className="rp-thead">
            <div />
            <div>Guard / date</div>
            <div className="h-shift">Shift</div>
            <div className="h-tl">
              <span>Day timeline</span>
              <span className="h-tl-scale num" aria-hidden="true">
                <em>6</em>
                <em>8</em>
                <em>10</em>
                <em>12</em>
                <em>14</em>
                <em>16</em>
                <em>18</em>
              </span>
            </div>
            <div className="r">Hours</div>
            <div className="r h-prod">Task time</div>
            <div className="r h-ot">OT</div>
            <div className="r h-jobs">Tasks</div>
            <div className="h-status">Status</div>
          </div>

          <div className="rp-body">
            {groups.length === 0 ? (
              <div className="rp-none">No shifts match these filters.</div>
            ) : (
              groups.map((g) => (
                <div key={g.key} className={`rp-group${openGroups.has(g.key) ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="rp-ghead"
                    onClick={() => toggleGroup(g.key)}
                    aria-expanded={openGroups.has(g.key)}
                  >
                    <ChevronRight className="rp-chev" size={16} strokeWidth={2} />
                    <div className="rp-person">
                      <span
                        className="rp-av"
                        style={{ background: g.meta.bg, color: g.meta.color }}
                      >
                        {g.meta.initials}
                      </span>
                      <span className="rp-person-text">
                        <span className="rp-pname">{g.title}</span>
                        <span className="rp-prole">
                          {g.meta.role.split('·')[0].trim()} ·{' '}
                          <b className="num">{g.meta.empId}</b>
                        </span>
                      </span>
                    </div>
                    <div>
                      <div className="rp-gnum num">{g.hours}</div>
                      <div className="rp-gsub">
                        {g.shifts} shift{g.shifts === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="h-prod">
                      <div className="rp-gnum num">{g.productive}</div>
                      <div className="rp-gsub">task time</div>
                    </div>
                    <div className="h-ot">
                      <div className="rp-gnum num">—</div>
                    </div>
                    <div className="h-jobs">
                      <div className="rp-gnum num">{g.jobs}</div>
                      <div className="rp-gsub">tasks</div>
                    </div>
                    <div className="h-status">
                      {g.alerts ? (
                        <span className="rp-badge warn">{g.alerts} needs review</span>
                      ) : (
                        <span className="rp-badge ok">All clear</span>
                      )}
                    </div>
                  </button>
                  {openGroups.has(g.key) ? (
                    <div className="rp-rows">
                      {g.days.map((day) => (
                        <ShiftRow
                          key={day.id}
                          day={day}
                          open={openDays.has(day.id)}
                          onToggle={() => toggleDay(day.id)}
                          setTip={setTip}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rp-note">
          <Info size={13} strokeWidth={2} />
          Security reporting shows task blocks on the 6 AM – 6 PM yard timeline. Hover bars for
          details.
        </div>
      </div>

      {tip ? (
        <div className="rp-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
          <b>{tip.title}</b>
          <span>{tip.line1}</span>
          {tip.line2 ? <span>{tip.line2}</span> : null}
        </div>
      ) : null}
    </section>
  )
}
