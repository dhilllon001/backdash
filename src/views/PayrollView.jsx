import { useMemo, useState, Fragment } from 'react'
import { ChevronRight, CalendarRange, X } from 'lucide-react'
import { Chip } from '../components/ui.jsx'
import { EMPLOYEES } from '../data/mock.js'

function matchesBase(emp, location, search) {
  if (emp.region !== 'ontario') return false
  const q = search.trim().toLowerCase()
  const locOk = location === 'all' || emp.yards.some((y) => y === location)
  const searchOk =
    !q ||
    emp.name.toLowerCase().includes(q) ||
    emp.role.toLowerCase().includes(q) ||
    emp.yards.some((y) => y.toLowerCase().includes(q))
  return locOk && searchOk
}

function matchesStatus(emp, statusFilter) {
  if (!statusFilter || statusFilter === 'all') return true
  if (statusFilter === 'on_shift') {
    return emp.status.tone === 'dang' && /open punch/i.test(emp.status.label)
  }
  if (statusFilter === 'overtime') return !!emp.ot
  if (statusFilter === 'approved') return emp.status.tone === 'ok'
  if (statusFilter === 'ready') return emp.status.tone === 'info' || emp.canApprove
  if (statusFilter === 'blocked') return emp.status.tone === 'dang'
  if (statusFilter === 'pending') {
    return emp.status.tone === 'info' || (emp.canApprove && emp.status.tone !== 'ok')
  }
  return true
}

function needsPunch(emp) {
  return emp.status?.tone === 'dang' || /punch/i.test(emp.status?.label || '')
}

function EmpRow({ emp, onOpenPerson, onApprove, onResolvePunch }) {
  const punch = needsPunch(emp)
  const approved = emp.status?.tone === 'ok'
  return (
    <tr className="data" onClick={() => onOpenPerson(emp.id)}>
      <td>
        <div className="person one-line">
          <div className="pav" style={{ background: emp.bg, color: emp.color }}>
            {emp.initials}
          </div>
          <span className="emp-line">
            <b>{emp.name}</b>
            <span className="sep">·</span>
            <span className="muted">{emp.role}</span>
          </span>
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
      <td className="num mono" style={{ fontWeight: 700 }}>
        {emp.payable}
      </td>
      <td className="num mono">{emp.reg}</td>
      <td className="num mono">
        {emp.ot ? <span className="ot-badge">OT {emp.ot}</span> : '—'}
      </td>
      <td className="num mono">{emp.jobHrs}</td>
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
          <span className="mono util-pct">{emp.util}%</span>
        </div>
      </td>
      <td className="num mono">{emp.jobs}</td>
      <td>
        <Chip tone={emp.status.tone}>{emp.status.label}</Chip>
      </td>
      <td>
        <div className="row-actions">
          {punch ? (
            <button
              type="button"
              className="btn btn-sm btn-danger-soft"
              onClick={(e) => {
                e.stopPropagation()
                onResolvePunch?.(emp.id)
              }}
            >
              Resolve punch
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-sm${emp.canApprove ? ' btn-primary' : ''}`}
              disabled={!emp.canApprove || approved}
              onClick={(e) => {
                e.stopPropagation()
                onApprove?.(emp.id)
              }}
            >
              {approved ? 'Approved' : 'Approve'}
            </button>
          )}
          <span className="caret">
            <ChevronRight size={14} strokeWidth={2.4} />
          </span>
        </div>
      </td>
    </tr>
  )
}

const PERIODS = [
  { id: 'current', label: 'Jul 7 – 20' },
  { id: 'prev', label: 'Jun 23 – Jul 6' },
  { id: 'month', label: 'July 2026' },
]

const STATUS_OPTS = [
  { id: 'all', label: 'All statuses' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'ready', label: 'Ready to approve' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'overtime', label: 'Has OT' },
]

const KPI_META = [
  { id: 'on_shift', label: 'On shift now' },
  { id: 'overtime', label: 'Overtime' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'ready', label: 'Ready' },
  { id: 'approved', label: 'Approved' },
]

export function PayrollView({
  employees = EMPLOYEES,
  location,
  search,
  onOpenPerson,
  onApprove,
  onResolvePunch,
}) {
  const [kpiFilter, setKpiFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [period, setPeriod] = useState('current')
  const [utilMin, setUtilMin] = useState('all')

  const baseRows = useMemo(
    () => employees.filter((e) => matchesBase(e, location, search)),
    [employees, location, search],
  )

  const counts = useMemo(() => {
    const onShift = baseRows.filter(
      (e) => e.status.tone === 'dang' && /open punch/i.test(e.status.label),
    ).length
    const withOt = baseRows.filter((e) => !!e.ot).length
    const approved = baseRows.filter((e) => e.status.tone === 'ok').length
    const blocked = baseRows.filter((e) => e.status.tone === 'dang').length
    const ready = baseRows.filter((e) => e.canApprove || e.status.tone === 'info').length
    return { onShift, withOt, approved, blocked, ready, total: baseRows.length }
  }, [baseRows])

  const activeStatus = kpiFilter || (statusFilter === 'all' ? null : statusFilter)

  const rows = useMemo(() => {
    return baseRows.filter((emp) => {
      const statusOk = matchesStatus(emp, activeStatus)
      const utilOk =
        utilMin === 'all' ||
        (utilMin === 'high' && emp.util >= 75) ||
        (utilMin === 'mid' && emp.util >= 50 && emp.util < 75) ||
        (utilMin === 'low' && emp.util < 50)
      return statusOk && utilOk
    })
  }, [baseRows, activeStatus, utilMin])

  const groups = useMemo(() => [{ id: 'flat', label: null, rows }], [rows])

  const toggleKpi = (id) => {
    setKpiFilter((prev) => {
      const next = prev === id ? null : id
      setStatusFilter(next ? 'all' : 'all')
      return next
    })
  }

  const clearFilters = () => {
    setKpiFilter(null)
    setStatusFilter('all')
    setUtilMin('all')
    setPeriod('current')
  }

  const activeFilters = [
    kpiFilter && { key: 'kpi', label: KPI_META.find((k) => k.id === kpiFilter)?.label },
    !kpiFilter &&
      statusFilter !== 'all' && {
        key: 'status',
        label: STATUS_OPTS.find((s) => s.id === statusFilter)?.label,
      },
    utilMin !== 'all' && {
      key: 'util',
      label: utilMin === 'high' ? 'Util ≥ 75%' : utilMin === 'mid' ? 'Util 50–74%' : 'Util < 50%',
    },
    period !== 'current' && {
      key: 'period',
      label: PERIODS.find((p) => p.id === period)?.label,
    },
  ].filter(Boolean)

  const kpis = [
    {
      id: 'on_shift',
      label: 'On shift now',
      value: String(counts.onShift),
      unit: `of ${counts.total}`,
      sub: location === 'all' ? 'All yards' : `${location} yard`,
      color: '#2B4FD3',
      soft: '#EEF1FD',
    },
    {
      id: 'overtime',
      label: 'Overtime',
      value: String(counts.withOt),
      unit: 'people',
      sub: 'Over OT threshold',
      color: '#C47A12',
      soft: '#FBF3E4',
    },
    {
      id: 'blocked',
      label: 'Blocked',
      value: String(counts.blocked),
      unit: 'exceptions',
      sub: 'Need review before export',
      color: '#B42318',
      soft: '#FDECEC',
    },
    {
      id: 'ready',
      label: 'Ready',
      value: String(counts.ready),
      unit: 'to approve',
      sub: 'Clear for timesheet sign-off',
      color: '#1E7E82',
      soft: '#E6F5F6',
    },
    {
      id: 'approved',
      label: 'Approved',
      value: String(counts.approved),
      unit: `of ${counts.total}`,
      sub: 'Locked for payroll',
      color: '#1F7A43',
      soft: '#E6F6EC',
    },
  ]

  return (
    <section className="dash">
      <div className="dash-kpis">
        {kpis.map((k) => {
          const on = kpiFilter === k.id
          return (
            <button
              key={k.id}
              type="button"
              className={`dash-kpi${on ? ' on' : ''}`}
              style={{ '--kpi': k.color, '--kpi-soft': k.soft }}
              onClick={() => toggleKpi(k.id)}
              aria-pressed={on}
            >
              <i className="dash-kpi-stripe" aria-hidden />
              <div className="dash-kpi-main">
                <div className="dash-kpi-num">{k.value}</div>
                <div className="dash-kpi-meta">
                  <span className="dash-kpi-label">{k.label}</span>
                  <span className="dash-kpi-unit">{k.unit}</span>
                  <span className="dash-kpi-sub">{k.sub}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="dash-filters">
        <div className="dash-filter-group">
          <span className="dash-filter-label">
            <CalendarRange size={13} /> Period
          </span>
          <div className="dash-seg">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={period === p.id ? 'on' : ''}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-filter-group">
          <span className="dash-filter-label">Status</span>
          <select
            className="dash-filter-select"
            value={kpiFilter || statusFilter}
            onChange={(e) => {
              const v = e.target.value
              setKpiFilter(null)
              setStatusFilter(v)
            }}
          >
            {STATUS_OPTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
            <option value="on_shift">On shift now</option>
          </select>
        </div>

        <div className="dash-filter-group">
          <span className="dash-filter-label">Utilization</span>
          <select
            className="dash-filter-select"
            value={utilMin}
            onChange={(e) => setUtilMin(e.target.value)}
          >
            <option value="all">Any util</option>
            <option value="high">≥ 75%</option>
            <option value="mid">50–74%</option>
            <option value="low">&lt; 50%</option>
          </select>
        </div>

        <div className="dash-filter-group">
          <span className="dash-filter-label">Quick</span>
          <div className="dash-seg">
            <button
              type="button"
              className={kpiFilter === 'overtime' || statusFilter === 'overtime' ? 'on' : ''}
              onClick={() => toggleKpi('overtime')}
            >
              Has OT
            </button>
            <button type="button" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div className="dash-applied">
            {activeFilters.map((f) => (
              <span key={f.key} className="dash-achip">
                {f.label}
                <button
                  type="button"
                  aria-label={`Clear ${f.label}`}
                  onClick={() => {
                    if (f.key === 'kpi' || f.key === 'status') {
                      setKpiFilter(null)
                      setStatusFilter('all')
                    }
                    if (f.key === 'util') setUtilMin('all')
                    if (f.key === 'period') setPeriod('current')
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="card table-card">
        <table className="dash-table one-line">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Yard</th>
              <th className="num">Payable</th>
              <th className="num">Reg</th>
              <th className="num">OT</th>
              <th className="num">Job hrs</th>
              <th className="num">Util</th>
              <th className="num">Jobs</th>
              <th>Status</th>
              <th style={{ width: 100 }} />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.id}>
                {g.label ? (
                  <tr className="dept-group-row">
                    <td colSpan={10}>
                      <span className="dept-group-label">{g.label}</span>
                      <span className="dept-group-count">{g.rows.length} people</span>
                    </td>
                  </tr>
                ) : null}
                {g.rows.map((emp) => (
                  <EmpRow
                    key={emp.id}
                    emp={emp}
                    onOpenPerson={onOpenPerson}
                    onApprove={onApprove}
                    onResolvePunch={onResolvePunch}
                  />
                ))}
              </Fragment>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="empty-cell">
                  No people match these filters.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={2}>
                  {rows.length} people ·{' '}
                  {period === 'current'
                    ? 'Jul 7 – 20'
                    : PERIODS.find((p) => p.id === period)?.label}
                </td>
                <td className="num">—</td>
                <td className="num">—</td>
                <td className="num">—</td>
                <td className="num">—</td>
                <td className="num">—</td>
                <td className="num">—</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  )
}
