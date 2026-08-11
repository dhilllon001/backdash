import { useEffect, useMemo, useState } from 'react'
import {
  MapPin,
  AlertTriangle,
  Upload,
  Clock3,
  Pencil,
  CalendarRange,
  Camera,
  Search,
} from 'lucide-react'
import { Chip, formatClock } from '../components/ui.jsx'
import { LocationMap } from '../components/LocationMap.jsx'
import { buildLocationPings, clockInLocation } from '../data/locations.js'
import { getEmployee, getPersonShifts, buildShiftLedger } from '../data/mock.js'

function collectPhotos(jobs = []) {
  const items = []
  jobs.forEach((job) => {
    ;(job.photos || []).forEach((p, i) => {
      items.push({
        src: typeof p === 'string' ? p : p.src,
        label: (typeof p === 'object' && p.label) || `Photo ${i + 1}`,
        jobId: job.id,
        title: job.title,
        unit: job.unit,
        status: job.status,
        ago: ['12m ago', '48m ago', '1h ago', '2h ago', '3h ago'][items.length % 5],
      })
    })
  })
  return items
}

function jobsDoneCount(shifts) {
  return shifts.reduce((n, s) => n + (s.jobs?.filter((j) => j.status?.tone === 'ok').length || 0), 0)
}

function totalJobs(shifts) {
  return shifts.reduce((n, s) => n + (s.jobs?.length || 0), 0)
}

function toMin(t) {
  if (!t || t === '—') return null
  const [h, m] = String(t).split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function buildActivity(shift) {
  if (!shift || shift.dayOff) return []
  const events = []
  if (shift.in) {
    events.push({
      id: 'in',
      time: shift.in,
      tone: 'ok',
      title: 'Clocked in',
      detail: `Badge scan · ${shift.yard} yard`,
    })
  }
  ;(shift.jobs || []).forEach((j, idx) => {
    if (j.start) {
      events.push({
        id: `${j.id}-start`,
        time: j.start,
        tone: 'ok',
        title: `started ${j.title}`,
        detail: `${j.id} · ${j.unit}`,
      })
    }
    if (j.end) {
      events.push({
        id: `${j.id}-end`,
        time: j.end,
        tone: 'ok',
        title: `finished ${j.title}`,
        detail: `${j.actual || '—'} · ${j.status?.label || 'Done'}`,
      })
    } else if (j.start && idx === 0) {
      events.push({
        id: `${j.id}-pause`,
        time: j.start,
        tone: 'warn',
        title: `paused Waiting on materials`,
        detail: `${j.id} · still open`,
        soft: true,
      })
    }
  })
  if (shift.breakMin) {
    events.push({
      id: 'brk',
      time: '12:05',
      tone: 'muted',
      title: 'Break',
      detail: `${shift.breakMin} min unpaid meal`,
    })
  }
  if (shift.open) {
    events.push({
      id: 'missing',
      time: shift.exception?.time || '15:56',
      tone: 'warn',
      title: 'Punch-out missing',
      detail: shift.exception?.text || 'No punch-out recorded',
      alert: true,
    })
  } else if (shift.out) {
    events.push({
      id: 'out',
      time: shift.out,
      tone: 'ok',
      title: 'Clocked out',
      detail: `${shift.totalHours || shift.hoursLabel} paid · ${shift.productiveHours || shift.onJobs} productive`,
    })
  }
  return events.sort((a, b) => (toMin(a.time) ?? 0) - (toMin(b.time) ?? 0))
}

function EditPunchForm({ punchIn, punchOut, onSave, onCancel }) {
  const [inn, setInn] = useState(punchIn || '')
  const [out, setOut] = useState(punchOut || '')

  useEffect(() => {
    setInn(punchIn || '')
    setOut(punchOut || '')
  }, [punchIn, punchOut])

  return (
    <div className="pd-edit-punch">
      <div className="pd-edit-punch-head">
        <Pencil size={13} />
        Edit punch times
      </div>
      <div className="pd-edit-punch-row">
        <label>
          Punch in
          <input type="time" value={inn} onChange={(e) => setInn(e.target.value)} />
        </label>
        <label>
          Punch out
          <input type="time" value={out} onChange={(e) => setOut(e.target.value)} />
        </label>
      </div>
      <div className="pd-edit-punch-actions">
        <button type="button" className="btn btn-sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => onSave({ in: inn, out: out || null })}
        >
          Save hours
        </button>
      </div>
    </div>
  )
}

export function PersonDetailView({ personId, employee, onResolvePunch }) {
  const emp = employee || getEmployee(personId) || getEmployee('d1')
  const baseShifts = getPersonShifts(emp.id)

  const [rangeStart, setRangeStart] = useState('2026-07-07')
  const [rangeEnd, setRangeEnd] = useState('2026-07-20')
  const [showRange, setShowRange] = useState(false)
  const [listTab, setListTab] = useState('all')
  const [listPill, setListPill] = useState('all')
  const [listQuery, setListQuery] = useState('')
  const [edits, setEdits] = useState({})
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState('overview')
  const [activePing, setActivePing] = useState(null)

  const ledger = useMemo(() => {
    const merged = baseShifts.map((s) => {
      const patch = edits[s.id]
      if (!patch) return s
      const next = { ...s, ...patch }
      if (patch.out) {
        next.open = false
        next.hoursLabel = next.totalHours || next.hoursLabel
      }
      return next
    })
    return buildShiftLedger(merged, rangeStart, rangeEnd)
  }, [baseShifts, edits, rangeStart, rangeEnd])

  const worked = ledger.filter((s) => !s.dayOff)
  const dayOffCount = ledger.filter((s) => s.dayOff).length
  const openCount = ledger.filter((s) => s.open).length
  const closedCount = ledger.filter((s) => !s.dayOff && !s.open).length
  const otCount = ledger.filter((s) => s.barTone === 'ot').length

  const visibleLedger = useMemo(() => {
    const q = listQuery.trim().toLowerCase()
    return ledger.filter((s) => {
      if (listTab === 'worked' && s.dayOff) return false
      if (listTab === 'off' && !s.dayOff) return false
      if (listPill === 'open' && !s.open) return false
      if (listPill === 'closed' && (s.dayOff || s.open)) return false
      if (listPill === 'ot' && s.barTone !== 'ot') return false
      if (listPill === 'off' && !s.dayOff) return false
      if (!q) return true
      const hay = [
        s.day,
        s.yard,
        s.date,
        ...(s.jobs || []).flatMap((j) => [j.id, j.title, j.unit]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [ledger, listTab, listPill, listQuery])

  const [selectedId, setSelectedId] = useState(worked[0]?.id || ledger[0]?.id)
  const selected = ledger.find((s) => s.id === selectedId) || ledger[0]
  const photos = useMemo(() => collectPhotos(selected?.jobs), [selected])
  const activity = useMemo(() => buildActivity(selected), [selected])
  const done = jobsDoneCount(worked)
  const jobsTotal = totalJobs(worked)
  const primaryJob = selected?.jobs?.[0]
  const pings = useMemo(() => (selected ? buildLocationPings(selected) : []), [selected])
  const clockLoc = selected && !selected.dayOff ? clockInLocation(selected) : null

  const periodHours = emp.payable || '—'
  const periodProd = emp.jobHrs || '—'
  const periodUtil = emp.util != null ? `${emp.util}%` : '—'

  useEffect(() => {
    if (!visibleLedger.some((s) => s.id === selectedId)) {
      const first = visibleLedger[0] || ledger.find((s) => !s.dayOff) || ledger[0]
      setSelectedId(first?.id)
    }
  }, [visibleLedger, ledger, selectedId])

  useEffect(() => {
    setActivePing(pings[0]?.id || null)
  }, [selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectDay = (id) => {
    setSelectedId(id)
    setTab('overview')
    setEditing(false)
  }

  const savePunch = ({ in: inn, out }) => {
    if (!selected || selected.dayOff) return
    setEdits((prev) => ({
      ...prev,
      [selected.id]: {
        in: inn,
        out,
        open: !out,
        hoursLabel: out ? selected.hoursLabel : 'Open',
        totalHours: out ? selected.totalHours || selected.hoursLabel : '—',
      },
    }))
    setEditing(false)
  }

  const showOnMap = (pingId) => {
    setTab('location')
    setActivePing(pingId)
  }

  return (
    <section className="pd dash3">
      <div className="pd-shell">
        <aside className="pd-list">
          <div className="pd-list-profile">
            <div className="pav" style={{ background: emp.bg, color: emp.color }}>
              {emp.initials}
            </div>
            <div className="pd-list-profile-text">
              <b>{emp.name}</b>
              <span>
                {emp.role} · {emp.id?.toUpperCase?.() || emp.id}
              </span>
            </div>
          </div>

          <div className="pd-list-stats">
            <div>
              <span>Hours</span>
              <b className="num">{periodHours}</b>
            </div>
            <div>
              <span>Productive</span>
              <b className="num">{periodProd}</b>
            </div>
            <div>
              <span>Util.</span>
              <b className="num">{periodUtil}</b>
            </div>
          </div>

          <div className="pd-list-head">
            <div className="pd-list-tabs">
              <button
                type="button"
                className={listTab === 'all' ? 'on' : ''}
                onClick={() => {
                  setListTab('all')
                  setListPill('all')
                }}
              >
                All shifts <em>{ledger.length}</em>
              </button>
              <button
                type="button"
                className={listTab === 'worked' ? 'on' : ''}
                onClick={() => {
                  setListTab('worked')
                  setListPill('all')
                }}
              >
                Worked <em>{worked.length}</em>
              </button>
              <button
                type="button"
                className={listTab === 'off' ? 'on' : ''}
                onClick={() => {
                  setListTab('off')
                  setListPill('off')
                }}
              >
                Day off <em>{dayOffCount}</em>
              </button>
            </div>

            <label className="pd-list-search">
              <Search size={14} />
              <input
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder="Search shifts…"
                aria-label="Search shifts"
              />
            </label>

            <div className="pd-list-tools">
              <div className="pd-list-pills">
                <button
                  type="button"
                  className={listPill === 'all' ? 'on' : ''}
                  onClick={() => setListPill('all')}
                >
                  All {ledger.length}
                </button>
                <button
                  type="button"
                  className={listPill === 'open' ? 'on' : ''}
                  onClick={() => setListPill('open')}
                >
                  Open {openCount}
                </button>
                <button
                  type="button"
                  className={listPill === 'closed' ? 'on' : ''}
                  onClick={() => setListPill('closed')}
                >
                  Closed {closedCount}
                </button>
                <button
                  type="button"
                  className={listPill === 'ot' ? 'on' : ''}
                  onClick={() => setListPill('ot')}
                >
                  OT {otCount}
                </button>
              </div>
              <button
                type="button"
                className={`pd-range-btn${showRange ? ' on' : ''}`}
                onClick={() => setShowRange((v) => !v)}
                title="Date range"
                aria-label="Date range filter"
              >
                <CalendarRange size={15} strokeWidth={2.2} />
              </button>
            </div>

            {showRange ? (
              <div className="pd-range-inline">
                <input
                  type="date"
                  className="pd-range-input"
                  value={rangeStart}
                  max={rangeEnd}
                  onChange={(e) => setRangeStart(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  className="pd-range-input"
                  value={rangeEnd}
                  min={rangeStart}
                  onChange={(e) => setRangeEnd(e.target.value)}
                />
              </div>
            ) : null}
          </div>

          <div className="pd-list-body">
            {visibleLedger.map((s) => {
              const job = s.jobs?.[0]
              const extra = Math.max((s.jobs?.length || 0) - 1, 0)
              const statusLabel = s.dayOff
                ? 'Day off'
                : s.open
                  ? 'Open punch'
                  : s.barTone === 'ot'
                    ? 'OT'
                    : 'Closed'
              const statusTone = s.dayOff
                ? 'muted'
                : s.open
                  ? 'warn'
                  : s.barTone === 'ot'
                    ? 'warn'
                    : 'ok'
              const priority = s.open
                ? 'High priority'
                : s.barTone === 'ot'
                  ? 'Medium priority'
                  : 'Normal priority'

              return (
                <button
                  type="button"
                  key={s.id}
                  className={`pd-shift-card${selectedId === s.id ? ' on' : ''}${s.dayOff ? ' day-off' : ''}${s.open ? ' is-open' : ''}`}
                  onClick={() => selectDay(s.id)}
                  data-tip={
                    s.dayOff
                      ? `${s.day} · Day off`
                      : `${s.day} · ${formatClock(s.in)} → ${s.open ? 'open' : formatClock(s.out)} · ${s.totalHours || s.hoursLabel}`
                  }
                >
                  <div className="pd-shift-top">
                    <span className="pd-shift-day">{s.day}</span>
                    <span className={`pd-mini-tag ${statusTone}`}>
                      {s.open ? <i className="pd-pulse" /> : null}
                      {statusLabel}
                    </span>
                  </div>

                  <div className="pd-shift-title">
                    {s.dayOff
                      ? 'No work recorded'
                      : job
                        ? `${job.title}${extra ? ` +${extra}` : ''}`
                        : `${s.jobCount} jobs`}
                  </div>
                  <div className="pd-shift-loc">
                    {s.dayOff ? 'Scheduled day off' : `${s.yard} · ${priority}`}
                  </div>

                  {!s.dayOff ? (
                    <div className="pd-shift-barrow">
                      <span className="pd-shift-range num">
                        {formatClock(s.in)} → {s.open ? 'open' : formatClock(s.out)}
                      </span>
                      <div className="pd-mini-rail">
                        {(s.segs || [])
                          .filter((seg) => seg.type !== 'sched')
                          .map((seg, i) => (
                            <i
                              key={i}
                              className={seg.type}
                              style={{ left: seg.left, width: seg.width }}
                            />
                          ))}
                      </div>
                      <span className="pd-shift-dur num">
                        {s.open ? s.productiveHours || s.onJobs : s.totalHours || s.hoursLabel}
                      </span>
                    </div>
                  ) : null}
                </button>
              )
            })}
            {visibleLedger.length === 0 ? (
              <div className="pd-list-empty">No shifts match these filters.</div>
            ) : null}
          </div>
        </aside>

        <div className="pd-detail">
          <div className="pd-detail-scroll">
            {selected?.dayOff ? (
              <div className="pd-dayoff">
                <div className="pd-dayoff-badge">Day off</div>
                <h2>{selected.day}</h2>
                <p>
                  No punch-in, jobs, or location pings for this day in the selected range.
                </p>
              </div>
            ) : (
              <>
                {selected.open ? (
                  <div className="pd-warn-banner">
                    <AlertTriangle size={15} />
                    <span>No punch-out recorded — this shift can&apos;t be paid until resolved.</span>
                    <div className="pd-warn-actions">
                      <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
                        Enter manually
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          onResolvePunch
                            ? onResolvePunch()
                            : savePunch({ in: selected.in, out: '15:56' })
                        }
                      >
                        Use 3:56 PM
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="pd-hero">
                  <div className="pd-hero-top">
                    <div className="pd-hero-title">
                      <span className="pd-hero-id">
                        {selected.day} · Shift {(selected.date || '').replace(/-/g, '')}
                      </span>
                      <h2>
                        {primaryJob ? primaryJob.title : 'Shift detail'}
                        {primaryJob?.unit && primaryJob.unit !== '—' ? (
                          <span className="pd-hero-unit"> · {primaryJob.unit}</span>
                        ) : null}
                      </h2>
                      <div className="pd-hero-loc">
                        <MapPin size={13} strokeWidth={2.2} />
                        {selected.yard} · {emp.role} · {emp.id}
                      </div>
                    </div>
                    <div className="pd-hero-tags">
                      <span className={`pd-tag ${selected.open ? 'warn' : 'ok'}`}>
                        {selected.open ? 'Open punch' : 'Closed'}
                      </span>
                      <span className="pd-tag muted">{selected.jobCount} jobs</span>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setEditing((v) => !v)}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  </div>

                  <div className="pd-meta-strip">
                    <div>
                      <span>Clock in</span>
                      <b>{formatClock(selected.in)}</b>
                    </div>
                    <div>
                      <span>Clock out</span>
                      <b className={selected.open ? 'miss' : ''}>
                        {selected.open ? 'Missing' : formatClock(selected.out)}
                      </b>
                    </div>
                    <div>
                      <span>Paid hours</span>
                      <b>{selected.open ? '—' : selected.totalHours || selected.hoursLabel}</b>
                    </div>
                    <div>
                      <span>Productive</span>
                      <b>{selected.productiveHours || selected.onJobs}</b>
                    </div>
                    <div>
                      <span>Utilisation</span>
                      <b>{selected.open ? '—' : periodUtil}</b>
                    </div>
                    <div>
                      <span>Period jobs</span>
                      <b>
                        {done}/{jobsTotal}
                      </b>
                    </div>
                  </div>
                </div>

                {editing ? (
                  <EditPunchForm
                    punchIn={selected.in}
                    punchOut={selected.out}
                    onSave={savePunch}
                    onCancel={() => setEditing(false)}
                  />
                ) : null}

                <div className="pd-tabs">
                  {[
                    ['overview', 'Overview'],
                    ['jobs', 'Jobs'],
                    ['shift', 'Punches'],
                    ['location', 'Location'],
                    ['pay', 'Pay codes'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={tab === id ? 'on' : ''}
                      onClick={() => setTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                  <button type="button" className="pd-upload">
                    <Upload size={13} strokeWidth={2.2} /> Upload
                  </button>
                </div>

                {tab === 'overview' ? (
                  <div className="pd-overview-stack">
                    {(selected.open ||
                      !selected.out ||
                      (selected.jobs || []).some((j) => !j.end) ||
                      !photos.length) && (
                      <div className="pd-alert-bar">
                        <AlertTriangle size={15} />
                        <div className="pd-alert-copy">
                          <b>
                            {selected.open
                              ? 'Punch-out missing'
                              : (selected.jobs || []).some((j) => !j.end)
                                ? 'Open job on this shift'
                                : 'Review needed'}
                          </b>
                          <span>
                            {[
                              selected.open ? 'No clock-out recorded' : null,
                              (selected.jobs || []).some((j) => !j.end)
                                ? 'At least one job is still in progress'
                                : null,
                              !photos.length ? 'No photos uploaded yet' : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                        {selected.open ? (
                          <div className="pd-warn-actions">
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => setEditing(true)}
                            >
                              Enter manually
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                onResolvePunch
                                  ? onResolvePunch()
                                  : savePunch({ in: selected.in, out: '15:56' })
                              }
                            >
                              Use 3:56 PM
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="pd-overview-grid">
                      <div className="pd-overview-main">
                        <section className="pd-block">
                          <div className="pd-sec-title">Photos</div>
                          <div className="pd-photo-grid">
                            {photos.map((p, i) => (
                              <figure
                                key={`${p.jobId}-${i}`}
                                className="pd-photo"
                                data-tip={`${p.jobId} · ${p.label} · ${p.ago}`}
                              >
                                <div className="pd-photo-head">
                                  <span>
                                    {p.jobId} {p.title}
                                  </span>
                                  {p.status ? (
                                    <Chip tone={p.status.tone} xs>
                                      {p.status.label}
                                    </Chip>
                                  ) : null}
                                </div>
                                <img src={p.src} alt={p.label} />
                                <figcaption>
                                  <span>{String(p.label).toUpperCase()}</span>
                                  <span>{p.ago}</span>
                                </figcaption>
                              </figure>
                            ))}
                            {selected.open ? (
                              <div className="pd-photo pd-photo-need">
                                <Camera size={22} />
                                <b>After photo required</b>
                                <span>Capture when the wrap is complete</span>
                              </div>
                            ) : null}
                            {!photos.length && !selected.open ? (
                              <div className="pd-empty">No photos for this day.</div>
                            ) : null}
                          </div>
                        </section>

                        <section className="pd-block">
                          <div className="pd-sec-title">Jobs on this shift</div>
                          <div className="pd-job-rows">
                            {(selected.jobs || []).map((j) => (
                              <div
                                className="pd-job-row"
                                key={j.id}
                                data-tip={`${j.id} · ${j.start || '—'} → ${j.end || 'open'} · ${j.actual}`}
                              >
                                <div className="pd-job-row-main">
                                  <span className="mono">{j.id}</span>
                                  <b>
                                    {j.title} · {j.unit}
                                  </b>
                                  <Chip tone={j.status.tone} xs>
                                    {j.status.label}
                                  </Chip>
                                </div>
                                <div className="pd-job-row-tl">
                                  <span className="num">
                                    {j.start ? formatClock(j.start) : '—'} →{' '}
                                    {j.end ? formatClock(j.end) : 'open'}
                                  </span>
                                  <div className="pd-job-bar">
                                    <i style={{ width: j.end ? '72%' : '48%' }} />
                                  </div>
                                  <span className="num pd-job-dur">{j.actual}</span>
                                </div>
                              </div>
                            ))}
                            {!selected.jobs?.length ? (
                              <div className="pd-empty">No jobs on this day.</div>
                            ) : null}
                          </div>
                        </section>
                      </div>

                      <aside className="pd-overview-activity">
                        <div className="pd-activity-head">
                          <span>Punch &amp; activity</span>
                          <em>{activity.length} events</em>
                        </div>
                        <div className="pd-activity-list">
                          {activity.map((ev) => (
                            <div
                              key={ev.id}
                              className={`pd-act${ev.tone === 'warn' ? ' warn' : ''}${ev.tone === 'muted' ? ' muted' : ''}${ev.alert ? ' alert' : ''}`}
                              data-tip={`${formatClock(ev.time)} · ${ev.title} · ${ev.detail}`}
                            >
                              <span className="pd-act-time num">{formatClock(ev.time)}</span>
                              <span className={`pd-act-dot ${ev.tone}`} />
                              <div className="pd-act-body">
                                <b>{ev.title}</b>
                                <span>{ev.detail}</span>
                              </div>
                            </div>
                          ))}
                          {selected.open ? (
                            <div className="pd-act-note">
                              <AlertTriangle size={14} />
                              <div>
                                <b>Punch-out missing</b>
                                <span>
                                  Unbooked time will appear once the shift is closed. Gate exit
                                  suggested {formatClock(selected.exception?.time || '15:56')}.
                                </span>
                              </div>
                            </div>
                          ) : null}
                          {clockLoc ? (
                            <button
                              type="button"
                              className="pd-act-map"
                              onClick={() => showOnMap(clockLoc.id)}
                            >
                              <MapPin size={13} />
                              Show clock-in on map
                            </button>
                          ) : null}
                        </div>
                      </aside>
                    </div>
                  </div>
                ) : null}

                {tab === 'jobs' ? (
                  <div className="pd-jobs-panel">
                    {(selected.jobs || []).map((job) => {
                      const jobPing = pings.find((p) => p.jobId === job.id)
                      return (
                        <div className="pd-job-detail" key={job.id}>
                          <div className="pd-job-detail-top">
                            <div>
                              <div className="pd-job-detail-title">
                                {job.title} · {job.unit}
                              </div>
                              <div className="pd-job-detail-sub mono">{job.id}</div>
                            </div>
                            <Chip tone={job.status.tone}>{job.status.label}</Chip>
                          </div>
                          <div className="pd-time-boxes three">
                            <div className="pd-tbox green">
                              <span>Time spent</span>
                              <b>{job.actual}</b>
                              <em>est {job.est}</em>
                            </div>
                            <div className="pd-tbox blue">
                              <span>Started</span>
                              <b>{job.start ? formatClock(job.start) : '—'}</b>
                              <em>{selected.day}</em>
                            </div>
                            <div className="pd-tbox gray">
                              <span>Ended</span>
                              <b>{job.end ? formatClock(job.end) : 'In progress'}</b>
                              <em>{job.status?.label || '—'}</em>
                            </div>
                          </div>
                          {jobPing ? (
                            <button
                              type="button"
                              className="pd-loc-chip compact"
                              onClick={() => showOnMap(jobPing.id)}
                            >
                              <MapPin size={13} />
                              <div>
                                <b>{jobPing.address}</b>
                                <em className="mono">
                                  {jobPing.lat.toFixed(5)}, {jobPing.lng.toFixed(5)}
                                </em>
                              </div>
                              <span className="pd-loc-chip-cta">Map →</span>
                            </button>
                          ) : null}
                          <div className="pd-photo-grid sm">
                            {(job.photos || []).map((p, i) => (
                              <figure key={i} className="pd-photo">
                                <img
                                  src={typeof p === 'string' ? p : p.src}
                                  alt={p.label || 'Photo'}
                                />
                                <figcaption>
                                  <span>{p.label || `Photo ${i + 1}`}</span>
                                  <span>checklist {job.checklist}</span>
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    {!selected.jobs?.length ? (
                      <div className="pd-empty">No jobs on this day.</div>
                    ) : null}
                  </div>
                ) : null}

                {tab === 'shift' ? (
                  <div className="pd-shift-panel">
                    <div className="pd-sec-title row">
                      <span>
                        <Clock3 size={13} /> Timeline · {selected.yard} · {selected.tz}
                      </span>
                      <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
                        <Pencil size={12} /> Edit hours
                      </button>
                    </div>
                    <div className="pd-rail-wrap">
                      <div className="rail-scale">
                        {['5 AM', '8 AM', '11 AM', '2 PM', '5 PM', '8 PM', '11 PM'].map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      <div className="rail tall">
                        {(selected.segs || []).map((seg, i) =>
                          seg.type === 'sched' ? (
                            <span
                              key={i}
                              className="sched"
                              style={{ left: seg.left, width: seg.width }}
                            />
                          ) : (
                            <span
                              key={i}
                              className={`seg ${seg.type}`}
                              style={{ left: seg.left, width: seg.width }}
                            />
                          ),
                        )}
                      </div>
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
                  </div>
                ) : null}

                {tab === 'location' ? (
                  <div className="pd-loc-panel">
                    <div className="pd-loc-list">
                      <div className="pd-sec-title">Location timeline · {pings.length} pings</div>
                      {pings.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          className={`pd-loc-item${activePing === p.id ? ' on' : ''}`}
                          onClick={() => setActivePing(p.id)}
                        >
                          <div className="pd-loc-item-top">
                            <b>{formatClock(p.time)}</b>
                            <Chip tone="neutral" xs>
                              {p.label}
                            </Chip>
                          </div>
                          <div className="pd-loc-item-addr">{p.address}</div>
                          <div className="pd-loc-item-coords mono">
                            {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                          </div>
                        </button>
                      ))}
                      {!pings.length ? (
                        <div className="pd-empty">No location pings for this shift.</div>
                      ) : null}
                    </div>
                    <div className="pd-loc-map-wrap">
                      <LocationMap
                        pings={pings}
                        activeId={activePing}
                        onSelect={setActivePing}
                      />
                    </div>
                  </div>
                ) : null}

                {tab === 'pay' ? (
                  <div className="pd-pay-panel">
                    <div className="pay-tbl">
                      <table>
                        <thead>
                          <tr>
                            <th>Pay code</th>
                            <th className="num">Hours</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <span className="code">REG</span> Regular
                            </td>
                            <td className="num">{emp.reg}</td>
                            <td>Standard shift hours</td>
                          </tr>
                          <tr>
                            <td>
                              <span className="code">OT1</span> Overtime
                            </td>
                            <td className="num">{emp.ot || '0:00'}</td>
                            <td>{emp.ot ? 'Pending OT approval' : 'None this period'}</td>
                          </tr>
                          <tr>
                            <td>
                              <span className="code">BRK</span> Unpaid break
                            </td>
                            <td className="num">(2:00)</td>
                            <td>Auto meal deductions</td>
                          </tr>
                          <tr className="tot">
                            <td>Payable total</td>
                            <td className="num">{emp.payable}</td>
                            <td>Hours only · no dollar amounts</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <aside className="pd-activity pd-activity-rail">
          <div className="pd-activity-head">
            <span>Punch &amp; activity</span>
            <em>{activity.length} events</em>
          </div>
          {selected?.dayOff ? (
            <div className="pd-empty">No punch activity on a day off.</div>
          ) : (
            <div className="pd-activity-list">
              {activity.map((ev) => (
                <div
                  key={ev.id}
                  className={`pd-act${ev.tone === 'warn' ? ' warn' : ''}${ev.tone === 'muted' ? ' muted' : ''}${ev.alert ? ' alert' : ''}`}
                  data-tip={`${formatClock(ev.time)} · ${ev.title}`}
                >
                  <span className="pd-act-time num">{formatClock(ev.time)}</span>
                  <span className={`pd-act-dot ${ev.tone}`} />
                  <div className="pd-act-body">
                    <b>{ev.title}</b>
                    <span>{ev.detail}</span>
                  </div>
                </div>
              ))}
              {selected?.open ? (
                <div className="pd-act-note">
                  <AlertTriangle size={14} />
                  <div>
                    <b>Punch-out missing</b>
                    <span>
                      Unbooked time will appear here once the shift is closed. Gate exit suggested{' '}
                      {formatClock(selected.exception?.time || '15:56')}.
                    </span>
                  </div>
                </div>
              ) : null}
              {clockLoc ? (
                <button type="button" className="pd-act-map" onClick={() => showOnMap(clockLoc.id)}>
                  <MapPin size={13} />
                  Show clock-in on map
                </button>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
