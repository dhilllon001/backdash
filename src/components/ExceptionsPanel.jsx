import { useMemo, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Chip } from './ui.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'dang', label: 'Blocking' },
  { id: 'warn', label: 'Review' },
]

export function ExceptionsPanel({ open, exceptions, onClose, onResolve }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return exceptions
    return exceptions.filter((e) => e.severity === filter)
  }, [exceptions, filter])

  const blocking = exceptions.filter((e) => e.severity === 'dang').length
  const review = exceptions.filter((e) => e.severity === 'warn').length

  return (
    <>
      <div className={`scrim${open ? ' on' : ''}`} onClick={onClose} />
      <aside className={`drawer exc-panel${open ? ' on' : ''}`} role="dialog" aria-label="Exceptions">
        <div className="dw-head">
          <div>
            <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="var(--danger)" />
              Exceptions
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>
              {blocking} blocking · {review} need review
            </div>
          </div>
          <button className="dw-x" type="button" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="dw-body">
          <div className="exc-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? 'on' : ''}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {f.id === 'all' ? ` (${exceptions.length})` : ''}
                {f.id === 'dang' ? ` (${blocking})` : ''}
                {f.id === 'warn' ? ` (${review})` : ''}
              </button>
            ))}
          </div>

          {filtered.map((ex) => (
            <div
              key={ex.id}
              className={`exc-item ${ex.severity}`}
              onClick={() => onResolve?.(ex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onResolve?.(ex)}
            >
              <div className="exc-item-top">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="exc-item-title">{ex.type}</div>
                  <div className="exc-item-meta">
                    {ex.person} · {ex.empId} · {ex.location}
                  </div>
                </div>
                <Chip tone={ex.severity} xs>
                  {ex.severity === 'dang' ? 'Blocking' : 'Review'}
                </Chip>
              </div>
              <div className="exc-item-body">{ex.detail}</div>
              <div className="exc-item-meta" style={{ marginTop: 8 }}>
                {ex.when}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-3)' }}>
              No exceptions in this filter.
            </div>
          )}
        </div>
        <div className="dw-foot">
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>
            Clear blockers before payroll export
          </span>
          <div className="spacer" />
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>
    </>
  )
}
