import { useMemo, useState } from 'react'
import { ChevronRight, AlertTriangle, Search, Info, MapPin } from 'lucide-react'
import { SECURITY_PEOPLE, SEC_REPORT_SHIFTS, SEC_YARDS } from '../../data/security.js'

const W0 = 6 * 60
const W1 = 18 * 60
const WD = W1 - W0

const DEFAULT_FILTERS = {
  personId: 'all',
  location: 'all',
  start: '2026-07-07',
  end: '2026-07-20',
}

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
      yards: [],
    }
  }
  return {
    name: emp.name,
    role: emp.role,
    initials: emp.initials,
    color: emp.color,
    bg: emp.bg,
    empId: emp.role?.match(/SEC-\d+/)?.[0] || emp.id,
    yards: emp.yards || [],
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
    yard: row.yard || meta.yards[0] || '—',
    meta,
    hoursMin,
    prodMin,
    jobs,
    flagged: !!row.alerts?.length,
  }
}

const HOURS = [6, 8, 10, 12, 14, 16, 18]

export function SecurityReportingView() {
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [applied, setApplied] = useState(null)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [groupBy, setGroupBy] = useState('person')
  const [openDays, setOpenDays] = useState(() => new Set())
  const [openGroups, setOpenGroups] = useState(() => new Set())
  const [tip, setTip] = useState(null)

  const showSearch = !applied || editing

  const runSearch = () => {
    setApplied({ ...draft })
    setEditing(false)
    setOpenGroups(new Set())
    setOpenDays(new Set())
  }

  const rows = useMemo(() => {
    if (!applied) return []
    return SEC_REPORT_SHIFTS.filter((r) => {
      if (applied.personId !== 'all' && r.personId !== applied.personId) return false
      if (applied.location !== 'all' && r.yard !== applied.location) return false
      if (r.date < applied.start || r.date > applied.end) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      const meta = empMeta(r.personId)
      const hay =
        `${meta.name} ${r.yard || ''} ${r.dateLabel} ${r.jobs.map((j) => `${j.id} ${j.title}`).join(' ')}`.toLowerCase()
      return hay.includes(q)
    }).map(enrichShift)
  }, [applied, query])

  const groups = useMemo(() => {
    const map = new Map()
    rows.forEach((day) => {
      const key = groupBy === 'location' ? day.yard : day.personId
      if (!map.has(key)) {
        map.set(key, {
          key,
          meta: day.meta,
          yard: day.yard,
          title: groupBy === 'location' ? day.yard : day.meta.name,
          subtitle:
            groupBy === 'location'
              ? 'Location'
              : `${day.meta.empId} · ${day.meta.yards.join(', ') || day.yard}`,
          days: [],
          hoursMin: 0,
          prodMin: 0,
          jobs: 0,
          alerts: 0,
          people: new Set(),
        })
      }
      const g = map.get(key)
      g.days.push(day)
      g.people.add(day.personId)
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
      peopleCount: g.people.size,
    }))
  }, [rows, groupBy])

  const totals = useMemo(() => {
    const h = rows.reduce((n, d) => n + (d.hoursMin || 0), 0)
    const p = rows.reduce((n, d) => n + d.prodMin, 0)
    const j = rows.reduce((n, d) => n + d.jobs.length, 0)
    const flagged = rows.filter((d) => d.flagged).length
    return {
      h,
      p,
      j,
      flagged,
      util: h ? Math.round((p / h) * 1000) / 10 : 0,
      people: new Set(rows.map((r) => r.personId)).size,
    }
  }, [rows])

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

  const appliedPersonLabel =
    applied?.personId === 'all' ? 'All guards' : empMeta(applied.personId).name
  const appliedLocLabel = applied?.location === 'all' ? 'All locations' : applied?.location

  return (
    <section className={`rp srep${showSearch ? ' searching' : ''}`}>
      {showSearch ? (
        <div className="rp-empty">
          <div className="rp-empty-card">
            <h1>Reporting</h1>
            <p>Search by person, location, and date range to load security shift timelines.</p>
            <form
              className="rp-form"
              onSubmit={(e) => {
                e.preventDefault()
                runSearch()
              }}
            >
              <label className="rp-field">
                <span>Person</span>
                <select
                  value={draft.personId}
                  onChange={(e) => setDraft((f) => ({ ...f, personId: e.target.value }))}
                >
                  <option value="all">All guards</option>
                  {SECURITY_PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rp-field">
                <span>Location</span>
                <select
                  value={draft.location}
                  onChange={(e) => setDraft((f) => ({ ...f, location: e.target.value }))}
                >
                  <option value="all">All locations</option>
                  {SEC_YARDS.map((y) => (
                    <option key={y.id} value={y.name}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rp-range">
                <span className="rp-range-label">Date range</span>
                <div className="rp-range-row">
                  <label className="rp-field">
                    <span>From</span>
                    <input
                      type="date"
                      value={draft.start}
                      onChange={(e) => setDraft((f) => ({ ...f, start: e.target.value }))}
                    />
                  </label>
                  <span className="rp-range-sep">to</span>
                  <label className="rp-field">
                    <span>To</span>
                    <input
                      type="date"
                      value={draft.end}
                      min={draft.start}
                      onChange={(e) => setDraft((f) => ({ ...f, end: e.target.value }))}
                    />
                  </label>
                </div>
              </div>
              <div className="rp-actions">
                {applied ? (
                  <button
                    type="button"
                    className="rp-btn"
                    onClick={() => {
                      setDraft(applied)
                      setEditing(false)
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
                <button type="submit" className="rp-btn primary">
                  <Search size={14} /> Run report
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="rp-wrap rp-full">
          <div className="rp-toolbar srep-toolbar">
            <div className="srep-applied">
              <div className="srep-applied-person">
                {applied.personId !== 'all' ? (
                  <span
                    className="pav"
                    style={{
                      background: empMeta(applied.personId).bg,
                      color: empMeta(applied.personId).color,
                    }}
                  >
                    {empMeta(applied.personId).initials}
                  </span>
                ) : null}
                <div>
                  <b>{appliedPersonLabel}</b>
                  <span>
                    <MapPin size={12} strokeWidth={2.2} /> {appliedLocLabel} · {applied.start} →{' '}
                    {applied.end}
                  </span>
                </div>
              </div>
            </div>
            <div className="srep-tabs" role="tablist" aria-label="Group by">
              <button
                type="button"
                className={groupBy === 'person' ? 'on' : ''}
                onClick={() => {
                  setGroupBy('person')
                  setOpenGroups(new Set())
                }}
              >
                By person
              </button>
              <button
                type="button"
                className={groupBy === 'location' ? 'on' : ''}
                onClick={() => {
                  setGroupBy('location')
                  setOpenGroups(new Set())
                }}
              >
                By location
              </button>
            </div>
            <label className="rp-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter people, tasks…"
              />
            </label>
            <button type="button" className="rp-btn" onClick={() => setEditing(true)}>
              Edit search
            </button>
          </div>

          <div className="rp-kpis">
            <div className="rp-kpi">
              <div className="lab">Hours logged</div>
              <div className="val num">{formatMinutes(totals.h)}</div>
              <div className="meta">across {totals.people} guards</div>
            </div>
            <div className="rp-kpi">
              <div className="lab">Task time</div>
              <div className="val num">{formatMinutes(totals.p)}</div>
              <div className="meta">booked to checkpoints</div>
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

          <div className="rp-board">
            <div className="rp-scale">
              <span className="rp-scale-spacer" />
              <div className="rp-hours">
                {HOURS.map((h) => (
                  <span key={h}>{h}:00</span>
                ))}
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="rp-none">No shifts match this search.</div>
            ) : (
              groups.map((g) => {
                const open = openGroups.has(g.key)
                return (
                  <div key={g.key} className={`rp-person${open ? ' open' : ''}`}>
                    <button
                      type="button"
                      className="rp-person-head"
                      onClick={() => toggleGroup(g.key)}
                    >
                      <ChevronRight size={14} className="rp-caret" />
                      {groupBy === 'person' ? (
                        <span
                          className="pav"
                          style={{ background: g.meta.bg, color: g.meta.color }}
                        >
                          {g.meta.initials}
                        </span>
                      ) : (
                        <span className="srep-loc-av">
                          <MapPin size={14} strokeWidth={2.2} />
                        </span>
                      )}
                      <div className="rp-person-meta">
                        <b>{g.title}</b>
                        <span>
                          {groupBy === 'location'
                            ? `${g.peopleCount} guards · ${g.shifts} shifts · ${g.jobs} tasks`
                            : g.subtitle}
                        </span>
                      </div>
                      <span className="rp-person-hrs num">{g.hours}</span>
                      {g.alerts ? (
                        <span className="rp-flag">
                          <AlertTriangle size={12} /> {g.alerts}
                        </span>
                      ) : null}
                    </button>

                    {open
                      ? g.days.map((day) => {
                          const dayOpen = openDays.has(day.id)
                          return (
                            <div key={day.id} className="rp-day">
                              <button
                                type="button"
                                className="rp-day-head"
                                onClick={() => toggleDay(day.id)}
                              >
                                <span className="rp-day-label">
                                  {groupBy === 'location' ? (
                                    <>
                                      <b>{day.meta.name}</b>
                                      <span className="muted"> · {day.dateLabel}</span>
                                    </>
                                  ) : (
                                    day.dateLabel
                                  )}
                                </span>
                                <span className="srep-day-yard muted">{day.yard}</span>
                                <span className="num">
                                  {day.shiftStart} → {day.shiftEnd}
                                </span>
                                <span className="num">{day.hours || '—'}</span>
                                {day.flagged ? (
                                  <span className="rp-flag">
                                    <AlertTriangle size={11} /> Alert
                                  </span>
                                ) : null}
                              </button>
                              <div className="rp-rail">
                                {(day.jobs || []).map((j) => (
                                  <i
                                    key={j.id}
                                    className={`rp-block ${jobBlockClass(j.status)}`}
                                    style={{
                                      left: `${j.left ?? pos(j.startMin)}%`,
                                      width: `${j.width ?? Math.max(pos(j.endMin) - pos(j.startMin), 1.5)}%`,
                                    }}
                                    onMouseEnter={(e) =>
                                      setTip({
                                        x: e.clientX,
                                        y: e.clientY,
                                        title: j.title,
                                        detail: `${j.id} · ${j.hours || '—'} · ${j.status}`,
                                      })
                                    }
                                    onMouseLeave={() => setTip(null)}
                                  />
                                ))}
                              </div>
                              {dayOpen ? (
                                <div className="rp-day-jobs">
                                  {(day.jobs || []).map((j) => (
                                    <div key={j.id} className="rp-job-line">
                                      <span className="mono">{j.id}</span>
                                      <b>
                                        {j.title} · {j.unit}
                                      </b>
                                      <span className="muted">{j.status}</span>
                                      <span className="num">{j.hours || '—'}</span>
                                    </div>
                                  ))}
                                  {(day.alerts || []).map((a, i) => (
                                    <div key={i} className="rp-day-alert">
                                      <Info size={12} /> {a}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )
                        })
                      : null}
                  </div>
                )
              })
            )}
          </div>

          {tip ? (
            <div className="rp-tip" style={{ left: tip.x + 12, top: tip.y + 12 }}>
              <b>{tip.title}</b>
              <span>{tip.detail}</span>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
