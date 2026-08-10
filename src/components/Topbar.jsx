import { Search, UserPlus, Download, AlertTriangle } from 'lucide-react'

export function Topbar({
  location,
  onLocationChange,
  search,
  onSearchChange,
  exceptionCount,
  exceptionsOpen,
  onToggleExceptions,
  onAssign,
}) {
  return (
    <div className="topbar">
      <div className="top-search">
        <Search size={15} strokeWidth={2} />
        <input
          type="search"
          placeholder="Search people, jobs, units…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="loc-select">
        <select
          aria-label="Location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          <option value="all">All locations</option>
          <option value="Brampton">Brampton</option>
          <option value="Laredo">Laredo</option>
          <option value="Nuevo Laredo">Nuevo Laredo</option>
        </select>
      </div>
      <div className="topbar-right">
        <div className="live">
          <i />
          Live
        </div>
        <button
          type="button"
          className={`btn btn-sm btn-exc${exceptionsOpen ? ' on' : ''}`}
          onClick={onToggleExceptions}
          title="View all exceptions"
        >
          <AlertTriangle size={14} strokeWidth={2.2} />
          Exceptions
          <span className="badge">{exceptionCount}</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onAssign}>
          <UserPlus size={13} strokeWidth={2.4} />
          Assign work
        </button>
        <button type="button" className="btn btn-sm">
          <Download size={13} strokeWidth={2.2} />
          Export
        </button>
      </div>
    </div>
  )
}
