import { useMemo, useState } from 'react'
import { ChevronRight, AlertTriangle, Search, Info } from 'lucide-react'
import { buildJobReport } from '../data/jobReport.js'
import { EMPLOYEES, DEPARTMENTS } from '../data/mock.js'
import { useActivity } from '../context/ActivityContext.jsx'
import { PunchResolveModal } from '../components/WorkflowModals.jsx'

const DEPT_OPTS = [{ id: 'all', label: 'All departments' }, ...DEPARTMENTS]
const DEFAULT_FILTERS = {
  department: 'decals',
  personId: 'all',
  start: '2026-07-07',
  end: '2026-07-20',
}

const W0 = 6 * 60
const W1 = 18 * 60
const WD = W1 - W0
const OT_THRESHOLD = 8 * 60

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

function punchAlerts(shiftStart, shiftEnd) {
  const alerts = []
  if (!shiftStart || shiftStart === '—') alerts.push('Missing punch-in')
  if (!shiftEnd || shiftEnd === '—') alerts.push('Missing punch-out')
  return alerts
}

function calcShiftHours(start, end) {
  const a = timeToMinutes(start)
  const b = timeToMinutes(end)
  if (a == null || b == null) return '—'
  let diff = b - a
  if (diff < 0) diff += 24 * 60
  return formatMinutes(diff)
}

function pos(m) {
  return ((Math.min(Math.max(m, W0), W1) - W0) / WD) * 100
}

function empMeta(personId, fallbackName) {
  const emp = EMPLOYEES.find((e) => e.id === personId)
  if (emp) {
    return {
      name: emp.name,
      role: emp.role,
      initials: emp.initials,
      color: emp.color,
      bg: emp.bg,
      empId: emp.role?.match(/EMP-\d+/)?.[0] || emp.id,
    }
  }
  const parts = String(fallbackName || '??').split(' ')
  return {
    name: fallbackName || '—',
    role: 'Installer',
    initials: ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??',
    color: '#2B4FD3',
    bg: '#E4ECFB',
    empId: '—',
  }
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('done') || s.includes('complete') || s.includes('verified')) return 'ok'
  if (s.includes('stuck') || s.includes('blocked') || s.includes('rework')) return 'dang'
  if (s.includes('progress') || s.includes('doing') || s.includes('active')) return 'warn'
  if (s.includes('pending') || s.includes('missed')) return 'warn'
  return 'muted'
}

function jobBlockClass(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('verified')) return 'v'
  if (s.includes('complete') || s.includes('done')) return 'c'
  return 'p'
}

function addEnd(start, hours) {
  if (!start || start === '—' || !hours) return '—'
  const [sh, sm] = start.split(':').map(Number)
  const [hh, mm] = String(hours).split(':').map(Number)
  const total = (sh || 0) * 60 + (sm || 0) + (hh || 0) * 60 + (mm || 0)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function enrichDay(row) {
  const meta = empMeta(row.personId, row.person)
  const hoursMin = row.hours && row.hours !== '—' ? parseHours(row.hours) : null
  const prodMin = parseHours(row.productiveHours)
  const util = hoursMin ? Math.round((prodMin / hoursMin) * 1000) / 10 : null
  const otMin = hoursMin && hoursMin > OT_THRESHOLD ? hoursMin - OT_THRESHOLD : 0
  const jobs = (row.jobs || []).map((j) => {
    const sub = (j.subJobs || []).map((sj) => {
      const start = timeToMinutes(sj.start) || 0
      const dur = parseHours(sj.hours)
      return {
        ...sj,
        startMin: start,
        endMin: start + dur,
        endLabel: addEnd(sj.start, sj.hours),
      }
    })
    const s = sub[0]?.startMin ?? timeToMinutes(j.start) ?? W0
    const e = sub[sub.length - 1]?.endMin ?? timeToMinutes(j.end) ?? s
    return {
      ...j,
      sub,
      startMin: s,
      endMin: e,
      mins: sub.reduce((n, x) => n + (x.endMin - x.startMin), 0) || parseHours(j.hours),
    }
  })
  return {
    ...row,
    meta,
    hoursMin,
    prodMin,
    util,
    otMin,
    jobs,
    flagged: !!row.alerts?.length,
  }
}

function summarizeDays(days) {
  const clear = days.filter((d) => !d.flagged)
  const hoursMin = clear.reduce((n, d) => n + (d.hoursMin || 0), 0)
  const prodMin = clear.reduce((n, d) => n + d.prodMin, 0)
  const otMin = clear.reduce((n, d) => n + (d.otMin || 0), 0)
  const jobs = days.reduce((n, d) => n + d.jobs.length, 0)
  const alerts = days.filter((d) => d.flagged).length
  return {
    hours: formatMinutes(hoursMin),
    productive: formatMinutes(prodMin),
    ot: formatMinutes(otMin),
    hoursMin,
    prodMin,
    otMin,
    jobs,
    alerts,
    util: hoursMin ? Math.round((prodMin / hoursMin) * 1000) / 10 : 0,
    shifts: days.length,
  }
}

export function JobsView() {
  const { logActivity } = useActivity()
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [applied, setApplied] = useState(null)
  const [editing, setEditing] = useState(false)
  const [rows, setRows] = useState([])
  const [openKeys, setOpenKeys] = useState(() => new Set())
  const [openDays, setOpenDays] = useState(() => new Set())
  const [query, setQuery] = useState('')
  const [groupBy, setGroupBy] = useState('person')
  const [excludeFlagged, setExcludeFlagged] = useState(true)
  const [editRow, setEditRow] = useState(null)
  const [tip, setTip] = useState(null)

  const people = useMemo(
    () =>
      EMPLOYEES.filter(
        (e) => draft.department === 'all' || e.department === draft.department,
      ),
    [draft.department],
  )

  const enriched = useMemo(() => rows.map(enrichDay), [rows])

  const filteredDays = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched.filter((day) => {
      if (!q) return true
      const hay =
        `${day.meta.name} ${day.meta.role} ${day.meta.empId} ${day.dateLabel} ${day.date} ${day.jobs
          .map((j) => `${j.id} ${j.title} ${j.unit} ${(j.sub || []).map((s) => `${s.id} ${s.title}`).join(' ')}`)
          .join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [enriched, query])

  const groups = useMemo(() => {
    if (groupBy === 'date') {
      const map = new Map()
      filteredDays.forEach((day) => {
        const key = day.date
        if (!map.has(key)) {
          map.set(key, {
            key,
            kind: 'date',
            title: day.dateLabel,
            subtitle: day.date,
            days: [],
          })
        }
        map.get(key).days.push(day)
      })
      return [...map.values()]
        .sort((a, b) => (a.key < b.key ? 1 : -1))
        .map((g) => ({ ...g, ...summarizeDays(g.days) }))
    }

    if (groupBy === 'job') {
      const map = new Map()
      filteredDays.forEach((day) => {
        day.jobs.forEach((job) => {
          if (!map.has(job.id)) {
            map.set(job.id, {
              key: job.id,
              kind: 'job',
              title: job.title,
              subtitle: job.id,
              unit: job.unit,
              status: job.status,
              days: [],
              jobRefs: [],
            })
          }
          const g = map.get(job.id)
          g.jobRefs.push({ day, job })
          if (!g.days.find((d) => d.id === day.id)) g.days.push(day)
        })
      })
      return [...map.values()].map((g) => {
        const mins = g.jobRefs.reduce((n, x) => n + x.job.mins, 0)
        return {
          ...g,
          hours: formatMinutes(mins),
          productive: formatMinutes(mins),
          ot: '0:00',
          hoursMin: mins,
          prodMin: mins,
          otMin: 0,
          jobs: g.jobRefs.length,
          alerts: g.days.filter((d) => d.flagged).length,
          util: 100,
          shifts: g.days.length,
        }
      })
    }

    // person
    const map = new Map()
    filteredDays.forEach((day) => {
      if (!map.has(day.personId)) {
        map.set(day.personId, {
          key: day.personId,
          kind: 'person',
          meta: day.meta,
          title: day.meta.name,
          subtitle: day.meta.empId,
          days: [],
        })
      }
      map.get(day.personId).days.push(day)
    })
    return [...map.values()].map((g) => ({ ...g, ...summarizeDays(g.days) }))
  }, [filteredDays, groupBy])

  const totals = useMemo(() => {
    let h = 0
    let p = 0
    let ot = 0
    let j = 0
    let done = 0
    let flagged = 0
    const peopleSet = new Set()
    filteredDays.forEach((day) => {
      peopleSet.add(day.personId)
      const skip = excludeFlagged && day.flagged
      if (!skip) {
        h += day.hoursMin || 0
        p += day.prodMin
        ot += day.otMin || 0
      }
      if (day.flagged) flagged++
      j += day.jobs.length
      done += day.jobs.filter((x) => statusTone(x.status) === 'ok').length
    })
    return {
      h,
      p,
      ot,
      j,
      done,
      flagged,
      util: h ? Math.round((p / h) * 1000) / 10 : 0,
      people: peopleSet.size,
    }
  }, [filteredDays, excludeFlagged])

  const showSearch = !applied || editing

  const applyLiveDates = (next) => {
    const filters = { ...applied, ...next }
    const report = buildJobReport({
      personId: filters.personId,
      department: filters.department,
      start: filters.start,
      end: filters.end,
    })
    setRows(report.rows)
    setApplied(filters)
    setDraft(filters)
  }

  const runSearch = (filters = draft) => {
    const report = buildJobReport({
      personId: filters.personId,
      department: filters.department,
      start: filters.start,
      end: filters.end,
    })
    setRows(report.rows)
    setApplied({ ...filters })
    setEditing(false)
    setQuery('')
    setGroupBy('person')
    const first = report.rows[0]?.personId
    setOpenKeys(first ? new Set([first]) : new Set())
    setOpenDays(new Set())
  }

  const toggleKey = (key) => {
    setOpenKeys((prev) => {
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

  const savePunch = ({ date, time, reason, note, hours }) => {
    if (!editRow) return
    const shiftEnd = time || '—'
    const shiftStart = editRow.shiftStart || '06:52'
    const calc = calcShiftHours(shiftStart, shiftEnd)
    setRows((list) =>
      list.map((r) =>
        r.id === editRow.id
          ? {
              ...r,
              shiftStart,
              shiftEnd,
              hours: calc,
              productiveHours:
                calc !== '—'
                  ? formatMinutes(Math.max(0, parseHours(calc) - 15))
                  : r.productiveHours,
              alerts: punchAlerts(shiftStart, shiftEnd),
              punchNote: note || r.punchNote || '',
            }
          : r,
      ),
    )
    logActivity({
      area: 'jobs',
      action: 'punch_out',
      title: 'Resolved missed punch-out',
      detail: `${editRow.person} · ${date || editRow.date} · punch-out ${time} · ${reason}${
        note ? ` · ${note}` : ''
      }`,
      meta: { person: editRow.person, hours },
    })
    setEditRow(null)
  }

  return (
    <section className={`rp${showSearch ? ' searching' : ''}`}>
      {showSearch ? (
        <div className="rp-empty">
          <div className="rp-empty-card">
            <h1>Reporting</h1>
            <p>Search by department, person, and date range to load shift data.</p>
            <form
              className="rp-form"
              onSubmit={(e) => {
                e.preventDefault()
                runSearch()
              }}
            >
              <label className="rp-field">
                <span>Department</span>
                <select
                  value={draft.department}
                  onChange={(e) =>
                    setDraft((f) => ({
                      ...f,
                      department: e.target.value,
                      personId: 'all',
                    }))
                  }
                >
                  {DEPT_OPTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rp-field">
                <span>Person</span>
                <select
                  value={draft.personId}
                  onChange={(e) => setDraft((f) => ({ ...f, personId: e.target.value }))}
                >
                  <option value="all">All people</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
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
                  <Search size={14} strokeWidth={2.2} />
                  Search report
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="rp-wrap rp-full">
          <div className="rp-kpis">
            <div className="rp-kpi">
              <div className="lab">Hours logged</div>
              <div className="val num">{formatMinutes(totals.h)}</div>
              <div className="meta">
                {excludeFlagged && totals.flagged
                  ? `${totals.flagged} flagged held out`
                  : `across ${totals.people} people`}
              </div>
            </div>
            <div className="rp-kpi">
              <div className="lab">Productive</div>
              <div className="val num">{formatMinutes(totals.p)}</div>
              <div className="meta">time booked to a job</div>
            </div>
            <div className="rp-kpi">
              <div className="lab">Overtime</div>
              <div className="val num">{formatMinutes(totals.ot)}</div>
              <div className="meta">over 8h / shift</div>
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
            <label className="rp-search">
              <Search size={14} strokeWidth={2} />
              <input
                type="search"
                placeholder="Search person, job ID, sub-job or unit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <label className="rp-date-field">
              <span>From</span>
              <input
                type="date"
                value={applied.start}
                onChange={(e) => applyLiveDates({ start: e.target.value })}
              />
            </label>
            <label className="rp-date-field">
              <span>To</span>
              <input
                type="date"
                value={applied.end}
                min={applied.start}
                onChange={(e) => applyLiveDates({ end: e.target.value })}
              />
            </label>

            <div className="rp-seg" role="group" aria-label="Group by">
              {[
                { id: 'person', label: 'By person' },
                { id: 'date', label: 'By date' },
                { id: 'job', label: 'By job' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={groupBy === opt.id}
                  onClick={() => {
                    setGroupBy(opt.id)
                    setOpenKeys(new Set())
                    setOpenDays(new Set())
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="rp-switch">
              <input
                type="checkbox"
                checked={excludeFlagged}
                onChange={(e) => setExcludeFlagged(e.target.checked)}
              />
              <span className="rp-track" />
              Exclude flagged
            </label>

            <div className="rp-spacer" />
            <div className="rp-legend">
              <span>
                <i className="rp-sw v" />
                Verified
              </span>
              <span>
                <i className="rp-sw c" />
                Complete
              </span>
              <span>
                <i className="rp-sw p" />
                In progress
              </span>
            </div>
          </div>

          <div className="rp-card rp-scroll-card">
            <div className="rp-thead">
              <div />
              <div>{groupBy === 'job' ? 'Job' : groupBy === 'date' ? 'Date' : 'Person / date'}</div>
              <div className="h-shift">Shift</div>
              <div className="h-tl">Day timeline · 06:00 → 18:00</div>
              <div className="r">Hours</div>
              <div className="r h-prod">Productive</div>
              <div className="r h-ot">OT</div>
              <div className="r h-jobs">Jobs</div>
              <div className="h-status">Status</div>
            </div>

            <div className="rp-body">
              {groups.length === 0 ? (
                <div className="rp-none">No shifts match that search.</div>
              ) : (
                groups.map((g) => (
                  <ReportGroup
                    key={g.key}
                    group={g}
                    groupBy={groupBy}
                    open={openKeys.has(g.key)}
                    openDays={openDays}
                    onToggle={() => toggleKey(g.key)}
                    onToggleDay={toggleDay}
                    onResolve={(day) => setEditRow(day)}
                    tip={tip}
                    setTip={setTip}
                  />
                ))
              )}
            </div>

            <div className="rp-foot">
              <div />
              <div className="lbl">
                Period total
                <small>
                  {excludeFlagged && totals.flagged
                    ? `${totals.flagged} flagged held out`
                    : 'all shifts included'}
                </small>
              </div>
              <div className="h-shift" />
              <div className="h-tl" />
              <div className="r num">{formatMinutes(totals.h)}</div>
              <div className="r num h-prod">{formatMinutes(totals.p)}</div>
              <div className="r num h-ot">{formatMinutes(totals.ot)}</div>
              <div className="r h-jobs num">{totals.j}</div>
              <div className="h-status" />
            </div>
          </div>

          <div className="rp-note">
            <Info size={13} strokeWidth={2} />
            Overtime = hours beyond 8:00 on a shift. Hover the timeline to inspect each job block.
          </div>
        </div>
      )}

      {tip ? (
        <div className="rp-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
          <b>{tip.title}</b>
          <span>{tip.line1}</span>
          {tip.line2 ? <span>{tip.line2}</span> : null}
        </div>
      ) : null}

      {editRow ? (
        <PunchResolveModal
          employee={{
            name: editRow.person || editRow.meta?.name,
            role: editRow.meta?.role,
            status: { label: editRow.alerts?.[0] || 'Missing punch-out' },
          }}
          onClose={() => setEditRow(null)}
          onSave={savePunch}
        />
      ) : null}
    </section>
  )
}

function ReportGroup({
  group,
  groupBy,
  open,
  openDays,
  onToggle,
  onToggleDay,
  onResolve,
  tip,
  setTip,
}) {
  return (
    <div className={`rp-group${open ? ' open' : ''}`}>
      <button type="button" className="rp-ghead" onClick={onToggle} aria-expanded={open}>
        <ChevronRight className="rp-chev" size={16} strokeWidth={2} />
        <div className="rp-person">
          {groupBy === 'person' ? (
            <span className="rp-av" style={{ background: group.meta.bg, color: group.meta.color }}>
              {group.meta.initials}
            </span>
          ) : groupBy === 'job' ? (
            <span className="rp-av job">ID</span>
          ) : (
            <span className="rp-av date">D</span>
          )}
          <span className="rp-person-text">
            <span className="rp-pname">{group.title}</span>
            <span className="rp-prole">
              {groupBy === 'job' ? (
                <>
                  <b className="num">{group.subtitle}</b>
                  {group.unit ? ` · ${group.unit}` : ''}
                </>
              ) : groupBy === 'date' ? (
                `${group.days.length} people`
              ) : (
                <>
                  {group.meta.role.split('·')[0].trim()} · <b className="num">{group.meta.empId}</b>
                </>
              )}
            </span>
          </span>
        </div>
        <div>
          <div className="rp-gnum num">{group.hours}</div>
          <div className="rp-gsub">
            {group.shifts} shift{group.shifts === 1 ? '' : 's'}
          </div>
        </div>
        <div className="h-prod">
          <div className="rp-gnum num">{group.productive}</div>
          <div className="rp-gsub">productive</div>
        </div>
        <div className="h-ot">
          <div className="rp-gnum num">{group.ot}</div>
          <div className="rp-gsub">overtime</div>
        </div>
        <div className="h-jobs">
          <div className="rp-gnum num">{group.jobs}</div>
          <div className="rp-gsub">jobs</div>
        </div>
        <div className="h-status">
          {group.alerts ? (
            <span className="rp-badge warn">{group.alerts} needs review</span>
          ) : (
            <span className="rp-badge ok">All clear</span>
          )}
        </div>
      </button>

      {open ? (
        <div className="rp-rows">
          {groupBy === 'job'
            ? group.jobRefs.map(({ day, job }) => (
                <JobFlatRow
                  key={`${day.id}-${job.id}`}
                  day={day}
                  job={job}
                  open={openDays.has(`${day.id}-${job.id}`)}
                  onToggle={() => onToggleDay(`${day.id}-${job.id}`)}
                  setTip={setTip}
                />
              ))
            : group.days.map((day) => (
                <DayRow
                  key={day.id}
                  day={day}
                  showPerson={groupBy === 'date'}
                  open={openDays.has(day.id)}
                  onToggle={() => onToggleDay(day.id)}
                  onResolve={() => onResolve(day)}
                  setTip={setTip}
                />
              ))}
        </div>
      ) : null}
    </div>
  )
}

function DayRow({ day, open, onToggle, onResolve, showPerson, setTip }) {
  return (
    <div className={`rp-dayrow${open ? ' open' : ''}${day.flagged ? ' flag' : ''}`}>
      <button type="button" className="rp-dline" onClick={onToggle} aria-expanded={open}>
        <ChevronRight className="rp-chev" size={16} strokeWidth={2} />
        <span className="rp-date">
          {showPerson ? day.meta.name : day.dateLabel.replace(/^(\w+), /, '')}
          <small>{showPerson ? day.dateLabel : day.dateLabel.split(',')[0]}</small>
        </span>
        <span className="rp-shift num">
          {day.shiftStart} →{' '}
          {day.shiftEnd && day.shiftEnd !== '—' ? (
            day.shiftEnd
          ) : (
            <span className="miss">no punch-out</span>
          )}
        </span>
        <Timeline day={day} setTip={setTip} />
        <span className="rp-hrs num">
          {day.hoursMin != null ? formatMinutes(day.hoursMin) : <span className="muted">{day.hours}</span>}
        </span>
        <span className="rp-prod num h-prod">{formatMinutes(day.prodMin)}</span>
        <span className="rp-ot num h-ot">
          {day.otMin ? formatMinutes(day.otMin) : <span className="muted">—</span>}
        </span>
        <span className="rp-jobs num h-jobs">{day.jobs.length}</span>
        <span className="h-status">
          {day.flagged ? (
            <span className="rp-badge warn">
              <AlertTriangle size={11} strokeWidth={2} />
              {day.alerts[0]}
            </span>
          ) : day.otMin ? (
            <span className="rp-badge warn">OT {formatMinutes(day.otMin)}</span>
          ) : (
            <span className="rp-badge none">Approved</span>
          )}
        </span>
      </button>

      {open ? (
        <DayDetail day={day} onResolve={onResolve} setTip={setTip} />
      ) : null}
    </div>
  )
}

function JobFlatRow({ day, job, open, onToggle, setTip }) {
  return (
    <div className={`rp-dayrow${open ? ' open' : ''}`}>
      <button type="button" className="rp-dline" onClick={onToggle} aria-expanded={open}>
        <ChevronRight className="rp-chev" size={16} strokeWidth={2} />
        <span className="rp-date">
          {day.meta.name}
          <small>
            {job.id} · {day.dateLabel}
          </small>
        </span>
        <span className="rp-shift num">
          {job.sub[0]?.start || job.start} → {job.sub[job.sub.length - 1]?.endLabel || job.end}
        </span>
        <Timeline day={{ ...day, jobs: [job] }} setTip={setTip} />
        <span className="rp-hrs num">{formatMinutes(job.mins)}</span>
        <span className="rp-prod num h-prod">{formatMinutes(job.mins)}</span>
        <span className="rp-ot num h-ot">—</span>
        <span className="rp-jobs num h-jobs">{job.sub.length}</span>
        <span className="h-status">
          <span className={`rp-badge ${statusTone(job.status)}`}>{job.status}</span>
        </span>
      </button>
      {open ? (
        <div className="rp-detail">
          <JobCard job={job} index={0} setTip={setTip} />
        </div>
      ) : null}
    </div>
  )
}

function DayDetail({ day, onResolve, setTip }) {
  return (
    <div className="rp-detail">
      {day.jobs.map((job, i) => (
        <JobCard key={job.id} job={job} index={i} setTip={setTip} />
      ))}

      {day.flagged ? (
        <div className="rp-fixbar">
          <AlertTriangle size={15} strokeWidth={2} />
          <span>No punch-out recorded — resolve before including in period totals.</span>
          <button
            type="button"
            className="rp-btn"
            onClick={(e) => {
              e.stopPropagation()
              onResolve()
            }}
          >
            Set punch-out
          </button>
        </div>
      ) : (
        <div className="rp-dtot">
          <span>Day total</span>
          <span>
            <b className="num">{formatMinutes(day.hoursMin)}</b> on shift ·{' '}
            <b className="num">{formatMinutes(day.prodMin)}</b> productive
            {day.otMin ? (
              <>
                {' '}
                · <b className="num">OT {formatMinutes(day.otMin)}</b>
              </>
            ) : null}{' '}
            · <span className="muted">{day.util}% utilisation</span>
          </span>
        </div>
      )}
    </div>
  )
}

function JobCard({ job, index, setTip }) {
  return (
    <div className="rp-job">
      <div className="rp-jhead">
        <span className="rp-jtag">JOB {index + 1}</span>
        <span className="rp-jid num">{job.id}</span>
        <span className="rp-jname">{job.title}</span>
        <span className="rp-junit num">{job.unit}</span>
        <span className={`rp-badge ${statusTone(job.status)}`}>{job.status}</span>
        <span className="rp-jright">
          <span className="num">
            {job.sub[0]?.start || job.start} → {job.sub[job.sub.length - 1]?.endLabel || job.end}
          </span>
          <span className="rp-jdur num">{formatMinutes(job.mins)}</span>
        </span>
      </div>
      <div className="rp-sj-head">
        <span>Sub-job ID</span>
        <span>Name</span>
        <span>Start – End</span>
        <span>Bar</span>
        <span className="r">Hours</span>
        <span className="r">Status</span>
      </div>
      {job.sub.map((sj) => {
        const span = Math.max(job.endMin - job.startMin, 1)
        const left = ((sj.startMin - job.startMin) / span) * 100
        const width = Math.max(((sj.endMin - sj.startMin) / span) * 100, 2)
        return (
          <div
            key={sj.id}
            className="rp-sj"
            onMouseEnter={(e) =>
              setTip({
                x: e.clientX + 12,
                y: e.clientY + 14,
                title: `${sj.id} · ${sj.title}`,
                line1: `${sj.start} → ${sj.endLabel} · ${sj.hours}`,
                line2: `Job ${job.id} · ${sj.status}`,
              })
            }
            onMouseMove={(e) =>
              setTip((t) =>
                t
                  ? { ...t, x: e.clientX + 12, y: e.clientY + 14 }
                  : t,
              )
            }
            onMouseLeave={() => setTip(null)}
          >
            <span className="code num">{sj.id}</span>
            <span className="nm">{sj.title}</span>
            <span className="tm num">
              {sj.start} – {sj.endLabel}
            </span>
            <span className="mini">
              <i style={{ left: `${left}%`, width: `${width}%` }} />
            </span>
            <span className="d num">{sj.hours}</span>
            <span className="st">
              <i className={`rp-sdot ${statusTone(sj.status) === 'ok' ? '' : 'p'}`} />
              <span className="stt">{sj.status}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Timeline({ day, setTip }) {
  const ticks = []
  for (let t = W0; t <= W1; t += 120) ticks.push(t)
  const end = day.shiftEnd && day.shiftEnd !== '—' ? timeToMinutes(day.shiftEnd) : W1
  const start = timeToMinutes(day.shiftStart) || W0

  return (
    <div className="rp-tl">
      <div className="track2" />
      {ticks.map((t) => (
        <div key={t} className="tick" style={{ left: `${pos(t)}%` }} />
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
      {day.jobs.map((j) => (
        <div
          key={j.id}
          className={`blk ${jobBlockClass(j.status)}`}
          style={{
            left: `${pos(j.startMin)}%`,
            width: `${Math.max(pos(j.endMin) - pos(j.startMin), 0.7)}%`,
          }}
          onMouseEnter={(e) => {
            e.stopPropagation()
            setTip({
              x: e.clientX + 12,
              y: e.clientY + 14,
              title: `${j.id} · ${j.title}`,
              line1: `${j.unit} · ${j.status}`,
              line2: `${formatMinutes(j.startMin)} → ${formatMinutes(j.endMin)} · ${formatMinutes(j.mins)} · ${j.sub.length} sub-jobs`,
            })
          }}
          onMouseMove={(e) => {
            e.stopPropagation()
            setTip((t) => (t ? { ...t, x: e.clientX + 12, y: e.clientY + 14 } : t))
          }}
          onMouseLeave={() => setTip(null)}
        />
      ))}
    </div>
  )
}
