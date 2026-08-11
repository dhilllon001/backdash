import {
  Search,
  Download,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Share2,
  Plus,
  FileCheck2,
} from 'lucide-react'

export function Topbar({
  mode = 'default',
  showLocation,
  location,
  onLocationChange,
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
  onProofTimesheet,
  onShare,
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
            <button type="button" className="btn btn-sm" onClick={onProofTimesheet}>
              <FileCheck2 size={13} strokeWidth={2.2} />
              Proof timesheet
            </button>
            <button type="button" className="btn btn-sm" onClick={onShare}>
              <Share2 size={13} strokeWidth={2.2} />
              Share
            </button>
            <button type="button" className="btn btn-sm" onClick={onCreateJob}>
              <Plus size={13} strokeWidth={2.4} />
              Create job
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!canApprove}
              onClick={onApprove}
            >
              Approve timesheet
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
