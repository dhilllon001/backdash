import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Download,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { DEPARTMENTS } from '../data/mock.js'

function DeptFilter({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = value.filter((v) => v !== 'all')
  const active = selected.length ? selected : DEPARTMENTS.map((d) => d.id)

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (id) => {
    const next = active.includes(id)
      ? active.filter((d) => d !== id)
      : [...active, id]
    // Keep at least Decals selected for now
    onChange(next.length ? next : ['decals'])
  }

  const label =
    active.length === 1
      ? DEPARTMENTS.find((d) => d.id === active[0])?.label || 'Decals'
      : `${active.length} departments`

  return (
    <div className="dept-select" ref={ref}>
      <Briefcase size={13} strokeWidth={2.2} className="loc-icon" />
      <button
        type="button"
        className="dept-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <ChevronDown size={13} strokeWidth={2.2} />
      </button>
      {open ? (
        <div className="dept-menu" role="listbox">
          {DEPARTMENTS.map((d) => (
            <label key={d.id} className="dept-option">
              <input
                type="checkbox"
                checked={active.includes(d.id)}
                onChange={() => toggle(d.id)}
              />
              {d.label}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function Topbar({
  mode = 'default',
  showLocation,
  location,
  onLocationChange,
  departments,
  onDepartmentsChange,
  search,
  onSearchChange,
  exceptionCount,
  onOpenExceptions,
  onCreateJob,
  onBack,
  personLabel,
  personName,
  personMeta,
  canApprove,
  needsPunch,
  onApprove,
  onResolvePunch,
}) {
  const isPerson = mode === 'person'

  if (isPerson) {
    return (
      <header className="topbar person-topbar">
        <div className="topbar-inner person-mode">
          <div className="topbar-left">
            <button type="button" className="btn btn-sm top-back" onClick={onBack}>
              <ArrowLeft size={14} strokeWidth={2.2} />
              Dashboard
            </button>
            <div className="topbar-person-meta">
              {personName ? <strong className="topbar-person-name">{personName}</strong> : null}
              {personLabel || personMeta ? (
                <span className="topbar-person-sub">
                  {personLabel ? <span className="mono">{personLabel}</span> : null}
                  {personLabel && personMeta ? <span className="pd-dot" /> : null}
                  {personMeta ? <span>{personMeta}</span> : null}
                </span>
              ) : null}
            </div>
          </div>

          <div className="topbar-right">
            {needsPunch ? (
              <button type="button" className="btn btn-sm btn-danger-soft" onClick={onResolvePunch}>
                <i className="dot" /> Resolve punch
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!canApprove}
              onClick={onApprove}
            >
              Approve timesheet
            </button>
            <button type="button" className="btn btn-sm">
              <Download size={13} strokeWidth={2.2} />
              Export
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left-space" />

        <div className="topbar-center">
          <div className="top-search">
            <Search size={15} strokeWidth={2} />
            <input
              type="search"
              placeholder="Search people, jobs, units…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {showLocation ? (
            <>
              <div className="loc-select">
                <MapPin size={13} strokeWidth={2.2} className="loc-icon" />
                <select
                  aria-label="Location"
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                >
                  <option value="Brampton">Brampton</option>
                  <option value="all">All yards</option>
                </select>
              </div>
              <DeptFilter value={departments} onChange={onDepartmentsChange} />
            </>
          ) : null}
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="btn btn-sm btn-exc"
            onClick={onOpenExceptions}
            title="View exceptions"
          >
            <AlertTriangle size={13} strokeWidth={2.2} />
            Exceptions
            <span className="badge">{exceptionCount}</span>
          </button>
          <button type="button" className="btn btn-sm btn-primary apple-cta" onClick={onCreateJob}>
            <Plus size={13} strokeWidth={2.4} />
            Create job
          </button>
          <button type="button" className="btn btn-sm">
            <Download size={13} strokeWidth={2.2} />
            Export
          </button>
        </div>
      </div>
    </header>
  )
}
