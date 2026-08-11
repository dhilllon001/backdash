import { Fragment, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Chip, Kpi } from '../components/ui.jsx'
import { JOBS, UNITS, CREW_AVAILABLE } from '../data/mock.js'

function matchLocSearch(text, location, search) {
  const q = search.trim().toLowerCase()
  const locOk = location === 'all' || text.includes(location)
  const searchOk = !q || text.toLowerCase().includes(q)
  return locOk && searchOk
}

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

export function JobsView({ location, search, onAssign }) {
  const rows = JOBS.filter((j) =>
    matchLocSearch(`${j.id} ${j.title} ${j.unit} ${j.yard} ${j.assignee || ''}`, location, search),
  )

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Jobs board</h1>
          <div className="page-sub">Track open work, evidence, and blockers across the crew.</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={onAssign}>
            Assign work
          </button>
          <button type="button" className="btn btn-primary">
            + New job
          </button>
        </div>
      </div>

      <div className="kpis five">
        <Kpi label="Open jobs" value={String(rows.length)} sub="Assigned + in progress" />
        <Kpi label="Unassigned" value="3" sub="Oldest waiting 3d 4h" />
        <Kpi label="Blocked" value="2" sub="Waiting on vinyl stock" alert />
        <Kpi label="Awaiting review" value="5" sub="Office sign-off" />
        <Kpi label="First-time-right" value="91" unit="%" sub="2 rework this period" />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Unit</th>
              <th>Yard</th>
              <th>Assigned to</th>
              <th>Status</th>
              <th className="num">Age</th>
              <th className="num">Actual / est</th>
              <th>Priority</th>
              <th style={{ width: 100 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((job) => (
              <tr className="data" key={job.id}>
                <td>
                  <div className="cell-2l">
                    <span className="p mono" style={{ fontSize: 12.5 }}>
                      {job.id}
                    </span>
                    <span className="s">
                      {job.title} · <span className="tag">{job.tag}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="mono">{job.unit}</span>
                </td>
                <td>
                  <Chip tone="neutral" xs>
                    {job.yard}
                  </Chip>
                </td>
                <td>
                  {job.assignee || (
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <Chip tone={job.status.tone}>{job.status.label}</Chip>
                </td>
                <td className="num">{job.age}</td>
                <td className="num">
                  {job.actual ? (
                    <>
                      <span style={job.over ? { color: 'var(--danger)', fontWeight: 700 } : undefined}>
                        {job.actual}
                      </span>{' '}
                      <span style={{ color: 'var(--text-4)' }}>/{job.est}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-4)' }}>— /{job.est}</span>
                  )}
                </td>
                <td>
                  <Chip tone={job.priority.tone} xs>
                    {job.priority.label}
                  </Chip>
                </td>
                <td>
                  {!job.assignee ? (
                    <button type="button" className="btn btn-sm btn-primary" onClick={onAssign}>
                      Assign
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AssignView({ location, search, onAssign }) {
  const openJobs = JOBS.filter(
    (j) =>
      !j.assignee &&
      matchLocSearch(`${j.id} ${j.title} ${j.unit} ${j.yard}`, location, search),
  )
  const crew = CREW_AVAILABLE.filter((c) =>
    matchLocSearch(`${c.name} ${c.yard}`, location, search),
  )

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Assign work</h1>
          <div className="page-sub">Match open jobs to available crew members.</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={onAssign}>
            + Assign job
          </button>
        </div>
      </div>

      <div className="kpis five">
        <Kpi label="Unassigned" value={String(openJobs.length)} sub="Waiting for crew" />
        <Kpi label="On shift now" value="3" sub="Available to assign" />
        <Kpi label="Assigned today" value="8" sub="2 still queued" />
        <Kpi label="Avg wait" value="1.4" unit="d" sub="Oldest 3d 4h" />
        <Kpi label="Urgent" value="2" sub="Need assign now" />
      </div>

      <div className="assign-grid">
        <div className="card">
          <div className="card-head">
            <div className="h3">Open jobs to assign</div>
            <span className="count-pill">{openJobs.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Unit</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Age</th>
                <th style={{ width: 110 }} />
              </tr>
            </thead>
            <tbody>
              {openJobs.map((job) => (
                <tr className="data" key={job.id}>
                  <td>
                    <div className="cell-2l">
                      <span className="p mono" style={{ fontSize: 12.5 }}>
                        {job.id}
                      </span>
                      <span className="s">
                        {job.title} · <span className="tag">{job.tag}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="mono">{job.unit}</span>
                  </td>
                  <td>
                    <Chip tone="neutral" xs>
                      {job.yard}
                    </Chip>
                  </td>
                  <td>
                    <Chip tone={job.priority.tone} xs>
                      {job.priority.label}
                    </Chip>
                  </td>
                  <td className="num">{job.age}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-primary" onClick={onAssign}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="h3">Available crew</div>
            <span className="count-pill">{crew.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Location</th>
                <th>Load</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {crew.map((c) => (
                <tr className="data" key={c.name}>
                  <td>
                    <div className="person">
                      <div className="pav" style={{ background: c.bg, color: c.color }}>
                        {c.initials}
                      </div>
                      <div className="cell-2l">
                        <span className="p">{c.name}</span>
                        <span className="s">{c.role}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Chip tone="neutral" xs>
                      {c.yard}
                    </Chip>
                  </td>
                  <td>
                    <span className="mono">{c.load}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={onAssign}>
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function UnitsView({ location, search }) {
  const [openId, setOpenId] = useState('TRL-88421')
  const [localSearch, setLocalSearch] = useState('')
  const q = search || localSearch
  const rows = UNITS.filter((u) =>
    matchLocSearch(`${u.id} ${u.sub} ${u.yard}`, location, q),
  )

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Work by Unit</h1>
          <div className="page-sub">
            Labour and materials rolled up per tractor or trailer — cost basis for chargeback, plus
            marking status.
          </div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn">
            Chargeback preview
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search">
          <Search size={14} strokeWidth={2.2} />
          <input
            type="search"
            placeholder="Search unit #, VIN, plate…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <span className="k kbd">/</span>
        </div>
        <button type="button" className="fchip set">
          Period: <b>Jul 7 – Jul 20</b>
        </button>
        <button type="button" className="fchip">
          Unit type: <b>All</b>
        </button>
        <button type="button" className="fchip">
          Ownership: <b>All</b>
        </button>
        <button type="button" className="fchip">
          Marking status
        </button>
      </div>

      <div className="kpis five">
        <Kpi label="Units serviced" value="14" sub="9 trailers · 5 tractors" />
        <Kpi label="Labour on units" value="226" unit="h 41m" sub="88% of all job time" />
        <Kpi
          label="Unattributed labour"
          value="33"
          unit="h 51m"
          sub={
            <>
              3 jobs with no unit <span className="delta down">▼ fix</span>
            </>
          }
        />
        <Kpi label="Labour + material cost" value="9.4" unit="k cad" sub="6.9k labour · 2.5k material" />
        <Kpi label="Marking compliance" value="2" sub="units missing required markings" alert />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="h3">Units — Jul 7 to Jul 20</div>
          <span className="count-pill">{rows.length}</span>
          <div className="spacer" />
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
            Sorted by labour hours
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }} />
              <th>Unit</th>
              <th>Yard</th>
              <th className="num">Jobs</th>
              <th>Templates</th>
              <th className="num">Labour</th>
              <th className="num">vs est</th>
              <th className="num">Material</th>
              <th className="num">Total cost</th>
              <th>Markings</th>
              <th>Evidence</th>
              <th>Chargeback</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const open = openId === u.id
              return (
                <Fragment key={u.id}>
                  <tr
                    className={`data${open ? ' open-row' : ''}`}
                    onClick={() => setOpenId(open ? null : u.id)}
                  >
                    <td>
                      <span className="caret">
                        <ChevronRight size={12} strokeWidth={2.6} />
                      </span>
                    </td>
                    <td>
                      <div className="cell-2l">
                        <span className="p mono" style={{ fontSize: 12.5 }}>
                          {u.id}
                        </span>
                        <span className="s">{u.sub}</span>
                      </div>
                    </td>
                    <td>
                      <Chip tone="neutral" xs>
                        {u.yard}
                      </Chip>
                    </td>
                    <td className="num">{u.jobs}</td>
                    <td>
                      {u.templates.map((t) => (
                        <span key={t} className="tag" style={{ marginRight: 4 }}>
                          {t}
                        </span>
                      ))}
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>
                      {u.labour}
                    </td>
                    <td className="num">
                      <span style={u.over ? { color: 'var(--danger)', fontWeight: 700 } : undefined}>
                        {u.vsEst}
                      </span>
                    </td>
                    <td className="num">{u.material}</td>
                    <td className="num" style={{ fontWeight: 700 }}>
                      {u.total}
                      {u.ccy ? <span className="ccy">{u.ccy}</span> : null}
                    </td>
                    <td>
                      <Chip tone={u.marking.tone} xs>
                        {u.marking.label}
                      </Chip>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 12 }}>
                        {u.evidence}
                      </span>
                    </td>
                    <td>
                      <Chip tone="neutral" xs>
                        {u.chargeback}
                      </Chip>
                    </td>
                  </tr>
                  {open && u.history?.length > 0 ? (
                    <tr className="detail-row">
                      <td colSpan={12}>
                        <div className="unit-history">
                          <div className="dsec-title">Job history on {u.id}</div>
                          {u.history.map((job) => (
                            <div className="unit-job-card" key={job.id}>
                              <div className="unit-job-main">
                                <div className="person" style={{ gap: 10 }}>
                                  <span className="mj-id">{job.id}</span>
                                  <span className="tag">{job.tag}</span>
                                  <Chip tone={job.status.tone} xs>
                                    {job.status.label}
                                  </Chip>
                                </div>
                                <div style={{ fontWeight: 700, marginTop: 6 }}>{job.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                                  {job.person} ·{' '}
                                  <span style={job.over ? { color: 'var(--danger)', fontWeight: 700 } : undefined}>
                                    {job.actual}
                                  </span>{' '}
                                  / {job.est} est
                                </div>
                              </div>
                              <PhotoThumbs photos={job.photos} labels={job.labels} />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ConfigView() {
  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="h1">Configuration</h1>
          <div className="page-sub">Job templates, yards, pay rules, and approvals.</div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary">
            + Add template
          </button>
        </div>
      </div>

      <div className="assign-grid">
        <div className="card" style={{ padding: 16 }}>
          <div className="h3" style={{ marginBottom: 12 }}>
            Job templates
          </div>
          {[
            ['DEC-WRAP', 'Partial wrap', '5 steps · 180 min'],
            ['DEC-INST', 'Decal install', '5 steps · 150 min'],
            ['DEC-REP', 'Decal repair', '4 steps · 90 min'],
            ['DEC-PRT', 'Decal print', '3 steps · 60 min'],
          ].map(([code, name, meta]) => (
            <div
              key={code}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
                  <span className="tag">{code}</span> · {meta}
                </div>
              </div>
              <Chip tone="ok" xs>
                Active
              </Chip>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="h3" style={{ marginBottom: 12 }}>
            Yards
          </div>
          {[
            ['Brampton Yard', 'Ontario, Canada · EDT'],
            ['Laredo Yard', 'Texas, USA · CDT'],
            ['Nuevo Laredo', 'Tamaulipas, MX · CST'],
          ].map(([name, meta]) => (
            <div
              key={name}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
