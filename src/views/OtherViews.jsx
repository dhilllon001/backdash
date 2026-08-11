import { Fragment, useMemo, useState } from 'react'
import {
  ChevronRight,
  Search,
  X,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { Chip, Kpi, PhotoThumbs } from '../components/ui.jsx'
import { JOBS, UNITS, CREW_AVAILABLE } from '../data/mock.js'
import {
  INSTALL_TEMPLATES,
  EQUIPMENT_TYPES,
  equipmentLabel,
} from '../data/templates.js'

function matchLocSearch(text, location, search) {
  const q = search.trim().toLowerCase()
  const locOk = location === 'all' || text.includes(location)
  const searchOk = !q || text.toLowerCase().includes(q)
  return locOk && searchOk
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
      <div className="page-toolbar">
        <div className="page-actions" style={{ marginLeft: 0 }}>
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
      <div className="page-toolbar">
        <div className="page-actions" style={{ marginLeft: 0 }}>
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
                              <PhotoThumbs photos={job.photos} />
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
  const [templates, setTemplates] = useState(INSTALL_TEMPLATES)
  const [unitType, setUnitType] = useState('trailer')
  const [equipment, setEquipment] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(
    () => INSTALL_TEMPLATES.find((t) => t.type === 'trailer')?.id,
  )
  const [addOpen, setAddOpen] = useState(false)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((t) => {
      if (t.type !== unitType) return false
      if (equipment !== 'all' && t.equipment !== equipment) return false
      if (!q) return true
      const hay = [
        t.code,
        t.name,
        t.company,
        t.country,
        t.equipment,
        equipmentLabel(t.type, t.equipment),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [templates, unitType, equipment, query])

  const selected =
    filtered.find((t) => t.id === selectedId) || filtered[0] || templates[0]

  const switchUnit = (next) => {
    setQuery('')
    setUnitType(next)
    setEquipment('all')
    const first = templates.find((t) => t.type === next)
    if (first) setSelectedId(first.id)
  }

  const itemCount = selected?.sections?.reduce((n, s) => n + s.items.length, 0) || 0
  const equipOptions = EQUIPMENT_TYPES[unitType] || []

  const handleAdd = (form) => {
    const id = `tpl-${Date.now().toString(36)}`
    const tpl = {
      id,
      type: form.type,
      equipment: form.equipment,
      country: form.country,
      company: form.company.trim() || 'Charger Logistics',
      unitLabel: form.type === 'truck' ? 'Truck' : 'Trailer',
      usDot: null,
      code: form.code.trim() || `${form.type === 'truck' ? 'TRK' : 'TRL'}-NEW`,
      name: form.name.trim(),
      status: 'active',
      estMinutes: Number(form.estMinutes) || 180,
      summary: form.summary.trim() || 'Custom installation template.',
      photoPolicy: {
        beforeRequired: true,
        afterRequired: true,
        afterEachSection: true,
        note: '',
      },
      sections: [
        {
          id: 'main',
          title: 'Install markings',
          photoAfter: true,
          items: form.items
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      ],
    }
    if (!tpl.sections[0].items.length) {
      tpl.sections[0].items = ['Company logo', 'Unit number']
    }
    setTemplates((list) => [tpl, ...list])
    setUnitType(tpl.type)
    setEquipment('all')
    setSelectedId(id)
    setAddOpen(false)
  }

  if (!selected) return null

  return (
    <section className="cfg">
      <div className="cfg-toolbar">
        <div className="cfg-toolbar-right" style={{ marginLeft: 'auto' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add template
          </button>
        </div>
      </div>

      <div className="cfg-shell">
        <aside className="cfg-list">
          <div className="side-top">
            <label className="cfg-filter">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter templates…"
                aria-label="Filter templates"
              />
            </label>
            <div className="side-tabs" role="tablist" aria-label="Unit type">
              <button
                type="button"
                role="tab"
                aria-selected={unitType === 'trailer'}
                className={unitType === 'trailer' ? 'on' : ''}
                onClick={() => switchUnit('trailer')}
              >
                Trailer
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={unitType === 'truck'}
                className={unitType === 'truck' ? 'on' : ''}
                onClick={() => switchUnit('truck')}
              >
                Truck
              </button>
            </div>
          </div>

          <div className="side-tools-row">
            <select
              className="cfg-equip-select"
              value={equipment}
              aria-label="Equipment type"
              onChange={(e) => {
                const next = e.target.value
                setEquipment(next)
                const first = templates.find(
                  (t) =>
                    t.type === unitType &&
                    (next === 'all' || t.equipment === next),
                )
                if (first) setSelectedId(first.id)
              }}
            >
              <option value="all">All equipment</option>
              {equipOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="side-table-wrap">
            <table className="side-table">
              <thead>
                <tr>
                  <th className="col-name">Template</th>
                  <th className="col-mid">Company</th>
                  <th className="col-end">Code</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={selected?.id === t.id ? 'on' : ''}
                    onClick={() => setSelectedId(t.id)}
                    aria-selected={selected?.id === t.id}
                  >
                    <td className="side-name col-name">{t.name}</td>
                    <td className="side-meta col-mid">{t.company}</td>
                    <td className="side-code col-end mono">{t.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <div className="cfg-list-empty">No templates match this filter.</div>
            ) : null}
          </div>
        </aside>

        <div className="cfg-detail card">
          <div className="cfg-hero">
            <div className="cfg-hero-main">
              <div className="cfg-hero-kicker">
                <span className="mono">{selected.code}</span>
                <span className="cfg-hero-dot">·</span>
                <span>{selected.company}</span>
                <span className="cfg-hero-dot">·</span>
                <span>{selected.unitLabel}</span>
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
            </div>
            <div className="cfg-hero-tags">
              <span className="cfg-chip">{selected.country}</span>
              <span className="cfg-chip accent">
                {equipmentLabel(selected.type, selected.equipment)}
              </span>
              <span className="cfg-chip ok">Active</span>
            </div>
          </div>

          <div className="cfg-stats">
            <div className="cfg-stat">
              <span>Est. time</span>
              <b>
                {Math.floor(selected.estMinutes / 60)}h {selected.estMinutes % 60}m
              </b>
            </div>
            <div className="cfg-stat">
              <span>Sections</span>
              <b>{selected.sections.length}</b>
            </div>
            <div className="cfg-stat">
              <span>Checklist total</span>
              <b>{itemCount}</b>
            </div>
            <div className="cfg-stat">
              <span>Photo rules</span>
              <b>
                {[
                  selected.photoPolicy.beforeRequired,
                  selected.photoPolicy.afterEachSection,
                  selected.photoPolicy.afterRequired,
                ].filter(Boolean).length}
              </b>
            </div>
          </div>

          {(() => {
            const alerts = []
            if (!selected.usDot) {
              alerts.push({
                tone: selected.country === 'USA' ? 'warn' : 'info',
                title: 'No USDOT on template',
                text:
                  selected.country === 'USA'
                    ? 'USA units should include a USDOT number before install work starts.'
                    : 'Add a USDOT number if this unit will operate into the US.',
              })
            }
            if (
              !selected.photoPolicy?.beforeRequired ||
              !selected.photoPolicy?.afterRequired
            ) {
              alerts.push({
                tone: 'warn',
                title: 'Incomplete photo policy',
                text: 'Before and final after photos should both be required for install verification.',
              })
            }
            if (itemCount === 0) {
              alerts.push({
                tone: 'warn',
                title: 'Empty checklist',
                text: 'This template has no checklist items yet.',
              })
            }
            if (!alerts.length) return null
            return (
              <div className="cfg-alerts">
                {alerts.map((a) => (
                  <div key={a.title} className={`cfg-alert ${a.tone}`}>
                    <AlertTriangle size={15} />
                    <div>
                      <b>{a.title}</b>
                      <p>{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          <div className="cfg-body">
            <section className="cfg-block">
              <div className="cfg-block-head">
                <h3>Photo requirements</h3>
              </div>
              <ul className="cfg-rules">
                {selected.photoPolicy.beforeRequired ? (
                  <li>
                    <span className="cfg-rule-label">Before</span>
                    Take photos before any install work starts
                  </li>
                ) : null}
                {selected.photoPolicy.afterEachSection ? (
                  <li>
                    <span className="cfg-rule-label">Section</span>
                    Take photos after each checklist section
                  </li>
                ) : null}
                {selected.photoPolicy.afterRequired ? (
                  <li>
                    <span className="cfg-rule-label">Final</span>
                    Take after photos when the job is complete
                  </li>
                ) : null}
              </ul>
            </section>

            <section className="cfg-block">
              <div className="cfg-block-head">
                <h3>Checklist</h3>
                <span className="cfg-block-count">
                  {itemCount} items · {selected.sections.length} sections
                </span>
              </div>
              <div className="cfg-checklist">
                {selected.sections.map((section, idx) => (
                  <div className="cfg-section" key={section.id}>
                    <div className="cfg-section-head">
                      <div className="cfg-section-title">
                        <span className="cfg-section-num">{idx + 1}</span>
                        <b>{section.title}</b>
                      </div>
                      <div className="cfg-section-meta">
                        <span>{section.items.length} items</span>
                        {section.photoAfter ? (
                          <span className="cfg-photo-req">Photo after</span>
                        ) : null}
                      </div>
                    </div>
                    <ul className="cfg-checks">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {addOpen ? (
        <AddTemplateModal
          defaultType={unitType}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
        />
      ) : null}
    </section>
  )
}

function AddTemplateModal({ defaultType, onClose, onSave }) {
  const [form, setForm] = useState({
    type: defaultType || 'trailer',
    equipment: defaultType === 'truck' ? 'highway' : 'dry-van',
    country: 'Canada',
    company: 'Charger Logistics',
    code: '',
    name: '',
    estMinutes: '180',
    summary: '',
    items: 'Charger Logistics Logo\nUnit number',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const equip = EQUIPMENT_TYPES[form.type] || []
  const valid = form.name.trim().length > 1

  return (
    <div className="apple-scrim on" onClick={onClose}>
      <div className="apple-modal inv-modal on" onClick={(e) => e.stopPropagation()}>
        <div className="dw-head">
          <div>
            <div className="dw-title">Add template</div>
          </div>
          <button type="button" className="dw-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dw-body">
          <div className="inv-two">
            <label className="fld">
              <span>Unit</span>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value
                  set('type', type)
                  set('equipment', type === 'truck' ? 'highway' : 'dry-van')
                }}
              >
                <option value="trailer">Trailer</option>
                <option value="truck">Truck</option>
              </select>
            </label>
            <label className="fld">
              <span>Equipment</span>
              <select value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>
                {equip.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="inv-two">
            <label className="fld">
              <span>Country</span>
              <select value={form.country} onChange={(e) => set('country', e.target.value)}>
                <option>Canada</option>
                <option>USA</option>
                <option>Mexico</option>
              </select>
            </label>
            <label className="fld">
              <span>Company</span>
              <input value={form.company} onChange={(e) => set('company', e.target.value)} />
            </label>
          </div>
          <div className="inv-two">
            <label className="fld">
              <span>Code</span>
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="TRL-DRY-CA"
              />
            </label>
            <label className="fld">
              <span>Est. minutes</span>
              <input value={form.estMinutes} onChange={(e) => set('estMinutes', e.target.value)} />
            </label>
          </div>
          <label className="fld">
            <span>Template name</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Dry van installation — Canada"
              autoFocus
            />
          </label>
          <label className="fld">
            <span>Summary</span>
            <input value={form.summary} onChange={(e) => set('summary', e.target.value)} />
          </label>
          <label className="fld">
            <span>Checklist items (one per line)</span>
            <textarea
              className="cfg-add-ta"
              rows={5}
              value={form.items}
              onChange={(e) => set('items', e.target.value)}
            />
          </label>
        </div>
        <div className="dw-foot" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => onSave(form)}
          >
            Create template
          </button>
        </div>
      </div>
    </div>
  )
}
