import { useEffect, useMemo, useState } from 'react'
import {
  MapPin,
  AlertTriangle,
  Upload,
  Clock3,
  Pencil,
  CalendarRange,
  MoreVertical,
  Filter,
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
        unit: job.unit,
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
  const [listTab, setListTab] = useState('all') // all | worked | off
  const [listPill, setListPill] = useState('all') // all | open | closed | ot | off
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
    return ledger.filter((s) => {
      if (listTab === 'worked' && s.dayOff) return false
      if (listTab === 'off' && !s.dayOff) return false
      if (listPill === 'open' && !s.open) return false
      if (listPill === 'closed' && (s.dayOff || s.open)) return false
      if (listPill === 'ot' && s.barTone !== 'ot') return false
      if (listPill === 'off' && !s.dayOff) return false
      return true
    })
  }, [ledger, listTab, listPill])

  const [selectedId, setSelectedId] = useState(worked[0]?.id || ledger[0]?.id)
  const selected = ledger.find((s) => s.id === selectedId) || ledger[0]
  const photos = useMemo(() => collectPhotos(selected?.jobs), [selected])
  const done = jobsDoneCount(worked)
  const jobsTotal = totalJobs(worked)
  const primaryJob = selected?.jobs?.[0]
  const pings = useMemo(() => (selected ? buildLocationPings(selected) : []), [selected])
  const clockLoc = selected && !selected.dayOff ? clockInLocation(selected) : null

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
    <section className="pd">
      <div className="pd-shell">
        <aside className="pd-list">
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
                All shifts
              </button>
              <button
                type="button"
                className={listTab === 'worked' ? 'on' : ''}
                onClick={() => {
                  setListTab('worked')
                  setListPill('all')
                }}
              >
                Worked
              </button>
              <button
                type="button"
                className={listTab === 'off' ? 'on' : ''}
                onClick={() => {
                  setListTab('off')
                  setListPill('off')
                }}
              >
                Day off
                <span className="pd-tab-badge">{dayOffCount}</span>
              </button>
            </div>

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
              <button type="button" className="pd-range-btn" title="Filters" aria-label="Filters">
                <Filter size={15} strokeWidth={2.2} />
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
            {visibleLedger.map((s, idx) => {
              const job = s.jobs?.[0]
              const statusLabel = s.dayOff
                ? 'DAY OFF'
                : s.open
                  ? 'OPEN'
                  : s.barTone === 'ot'
                    ? 'OT'
                    : 'CLOSED'
              const statusTone = s.dayOff
                ? 'muted'
                : s.open
                  ? 'warn'
                  : s.barTone === 'ot'
                    ? 'warn'
                    : 'ok'
              const priority = s.open ? 'High priority' : s.barTone === 'ot' ? 'Medium priority' : 'Normal'
              const stripe =
                s.open || s.barTone === 'ot' ? 'orange' : s.dayOff ? 'gray' : 'blue'
              const zebra = idx % 3 === 0 ? 'z-white' : idx % 3 === 1 ? 'z-gray' : 'z-soft'

              return (
                <button
                  type="button"
                  key={s.id}
                  className={`pd-shift-card stripe-${stripe} ${zebra}${selectedId === s.id ? ' on' : ''}${s.dayOff ? ' day-off' : ''}`}
                  onClick={() => selectDay(s.id)}
                >
                  <i className="pd-shift-stripe" aria-hidden />
                  <div className="pd-shift-inner">
                    <div className="pd-shift-top">
                      <span className="pd-shift-id mono">{(s.date || s.short || '').replace(/-/g, '')}</span>
                      <div className="pd-shift-tags">
                        <span className={`pd-mini-tag ${statusTone}`}>{statusLabel}</span>
                        <span className="pd-mini-tag muted">{s.yard}</span>
                        <span className="pd-shift-more" aria-hidden>
                          <MoreVertical size={14} />
                        </span>
                      </div>
                    </div>

                    <div className="pd-shift-title">
                      {s.dayOff
                        ? 'No work recorded'
                        : job
                          ? job.title
                          : `${s.jobCount} job${s.jobCount === 1 ? '' : 's'}`}
                    </div>
                    <div className="pd-shift-loc">
                      <MapPin size={12} />
                      {s.dayOff ? 'Scheduled day off' : `${s.yard} · ${s.day}`}
                    </div>

                    <div className="pd-shift-grid">
                      <div>
                        <span>In</span>
                        <b>{s.dayOff || !s.in ? '—' : formatClock(s.in)}</b>
                      </div>
                      <div>
                        <span>Out</span>
                        <b>{s.dayOff || s.open ? '—' : formatClock(s.out)}</b>
                      </div>
                      <div>
                        <span>Total</span>
                        <b>{s.dayOff ? '0:00' : s.open ? 'Open' : s.totalHours || s.hoursLabel}</b>
                      </div>
                      <div>
                        <span>Productive</span>
                        <b>{s.dayOff ? '0:00' : s.productiveHours || s.onJobs}</b>
                      </div>
                    </div>

                    <div className="pd-shift-foot">
                      <span className="pd-shift-pri">
                        <i />
                        {priority}
                      </span>
                      <span className="pd-shift-assignee">
                        <i className="pav xs" style={{ background: emp.bg, color: emp.color }}>
                          {emp.initials}
                        </i>
                        {emp.name}
                      </span>
                    </div>
                  </div>
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
                No punch-in, jobs, or location pings for this day in the selected range. The worker
                did not record any work.
              </p>
            </div>
          ) : (
            <>
              <div className="pd-hero">
                <div className="pd-hero-top">
                  <div className="pd-hero-title">
                    <span className="pd-hero-id">{selected.day}</span>
                    <h2>
                      {primaryJob ? `${primaryJob.title}` : 'Shift detail'}
                      {primaryJob?.unit && primaryJob.unit !== '—' ? (
                        <span className="pd-hero-unit"> · {primaryJob.unit}</span>
                      ) : null}
                    </h2>
                  </div>
                  <div className="pd-hero-tags">
                    <span className="pd-tag muted">{selected.tz}</span>
                    <span className={`pd-tag ${selected.open ? 'warn' : 'ok'}`}>
                      {selected.open ? 'Open punch' : 'Shift closed'}
                    </span>
                    <span className="pd-tag accent">{selected.jobCount} jobs</span>
                    <span className="pd-tag info">{selected.yard}</span>
                  </div>
                </div>

                <div className="pd-hero-loc">
                  <MapPin size={13} strokeWidth={2.2} />
                  {selected.yard} yard · {emp.role}
                </div>

                <div className="pd-meta-strip">
                  <div>
                    <span>Clock in</span>
                    <b>{formatClock(selected.in)}</b>
                  </div>
                  <div>
                    <span>Clock out</span>
                    <b>{selected.open ? 'Still open' : formatClock(selected.out)}</b>
                  </div>
                  <div>
                    <span>Total hours</span>
                    <b>{selected.open ? '—' : selected.totalHours || selected.hoursLabel}</b>
                  </div>
                  <div>
                    <span>Productive</span>
                    <b>{selected.productiveHours || selected.onJobs}</b>
                  </div>
                  <div>
                    <span>Period jobs</span>
                    <b>
                      {done}/{jobsTotal}
                    </b>
                  </div>
                  <div className="pd-meta-person">
                    <span>Worker</span>
                    <b>
                      <i className="pav xs" style={{ background: emp.bg, color: emp.color }}>
                        {emp.initials}
                      </i>
                      {emp.name}
                    </b>
                  </div>
                </div>
              </div>

              <div className="pd-tabs">
                {[
                  ['overview', 'Overview'],
                  ['jobs', 'Jobs'],
                  ['shift', 'Shift'],
                  ['location', 'Location timeline'],
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
                <div className="pd-overview">
                  <div className="pd-photos">
                    <div className="pd-sec-title">Photos ({photos.length})</div>
                    {photos.length ? (
                      <div className="pd-photo-grid">
                        {photos.map((p, i) => (
                          <figure key={`${p.jobId}-${i}`} className="pd-photo">
                            <img src={p.src} alt={p.label} />
                            <figcaption>
                              <span>{p.label}</span>
                              <span>{p.ago}</span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <div className="pd-empty">No photos for this day.</div>
                    )}
                  </div>

                  <div className="pd-side">
                    <div className="pd-overview-card">
                      <div className="pd-sec-title row">
                        <span>Shift overview</span>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setEditing((v) => !v)}
                        >
                          <Pencil size={12} strokeWidth={2.2} />
                          Edit hours
                        </button>
                      </div>

                      {editing ? (
                        <EditPunchForm
                          punchIn={selected.in}
                          punchOut={selected.out}
                          onSave={savePunch}
                          onCancel={() => setEditing(false)}
                        />
                      ) : (
                        <div className="pd-time-boxes">
                          <div className="pd-tbox green">
                            <span>Productive hours</span>
                            <b>{selected.productiveHours || selected.onJobs}</b>
                            <em>Active work</em>
                          </div>
                          <div className="pd-tbox blue">
                            <span>Started</span>
                            <b>{formatClock(selected.in)}</b>
                            <em>{selected.day}</em>
                          </div>
                          <div className="pd-tbox gray">
                            <span>Ended</span>
                            <b>{selected.open ? 'Open' : formatClock(selected.out)}</b>
                            <em>{selected.open ? 'No punch-out' : selected.day}</em>
                          </div>
                        </div>
                      )}

                      {clockLoc ? (
                        <button
                          type="button"
                          className="pd-loc-chip"
                          onClick={() => showOnMap(clockLoc.id)}
                        >
                          <MapPin size={13} />
                          <div>
                            <b>
                              {formatClock(selected.in)} · Clocked in
                            </b>
                            <span>{clockLoc.address}</span>
                            <em className="mono">
                              {clockLoc.lat.toFixed(5)}, {clockLoc.lng.toFixed(5)}
                            </em>
                          </div>
                          <span className="pd-loc-chip-cta">Show on map →</span>
                        </button>
                      ) : null}

                      <div className="pd-worker-row">
                        <div className="pav" style={{ background: emp.bg, color: emp.color }}>
                          {emp.initials}
                        </div>
                        <div>
                          <div className="pd-worker-name">{emp.name}</div>
                          <div className="pd-worker-sub">{emp.role}</div>
                        </div>
                        <Chip tone={emp.status.tone} xs>
                          {emp.status.label}
                        </Chip>
                      </div>
                    </div>

                    <div className="pd-overview-card">
                      <div className="pd-sec-title">Jobs completed</div>
                      <div className="pd-job-sum">
                        <div>
                          <b>{selected.jobs?.filter((j) => j.status?.tone === 'ok').length || 0}</b>
                          <span>done today</span>
                        </div>
                        <div>
                          <b>{selected.jobs?.length || 0}</b>
                          <span>total today</span>
                        </div>
                        <div>
                          <b>
                            {done}/{jobsTotal}
                          </b>
                          <span>period</span>
                        </div>
                      </div>
                      <ul className="pd-job-mini">
                        {(selected.jobs || []).map((j) => (
                          <li key={j.id}>
                            <span className="mono">{j.id}</span>
                            <span className="grow">{j.title}</span>
                            <Chip tone={j.status.tone} xs>
                              {j.status.label}
                            </Chip>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selected.exception ? (
                      <button type="button" className="pd-exc-card" onClick={onResolvePunch}>
                        <AlertTriangle size={14} />
                        <div>
                          <b>{formatClock(selected.exception.time)}</b>
                          <span>{selected.exception.text}</span>
                        </div>
                        <em>Resolve →</em>
                      </button>
                    ) : null}
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
                              <img src={typeof p === 'string' ? p : p.src} alt={p.label || 'Photo'} />
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
                  {!selected.jobs?.length ? <div className="pd-empty">No jobs on this day.</div> : null}
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
                  {editing ? (
                    <EditPunchForm
                      punchIn={selected.in}
                      punchOut={selected.out}
                      onSave={savePunch}
                      onCancel={() => setEditing(false)}
                    />
                  ) : null}
                  <div className="pd-rail-wrap">
                    <div className="rail-scale">
                      {['5 AM', '8 AM', '11 AM', '2 PM', '5 PM', '8 PM', '11 PM'].map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="rail tall">
                      {(selected.segs || []).map((seg, i) =>
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
                  <div className="pd-shift-times">
                    <div>
                      <span>In</span>
                      <b>{formatClock(selected.in)}</b>
                    </div>
                    <div>
                      <span>Out</span>
                      <b>{selected.open ? 'Still open' : formatClock(selected.out)}</b>
                    </div>
                    <div>
                      <span>Total hours</span>
                      <b>{selected.open ? '—' : selected.totalHours || selected.hoursLabel}</b>
                    </div>
                    <div>
                      <span>Productive</span>
                      <b>{selected.productiveHours || selected.onJobs}</b>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === 'location' ? (
                <div className="pd-loc-panel">
                  <div className="pd-loc-list">
                    <div className="pd-sec-title">
                      Location timeline · {pings.length} pings
                    </div>
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
      </div>
    </section>
  )
}
