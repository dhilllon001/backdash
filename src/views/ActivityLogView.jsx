import { useMemo, useState } from 'react'
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  BookOpen,
  Activity,
} from 'lucide-react'
import { useActivity } from '../context/ActivityContext.jsx'
import {
  ACTIVITY_AREAS,
  formatActivityTime,
  activityTone,
} from '../data/activityLog.js'

const AREA_ICON = {
  payroll: LayoutDashboard,
  punch: Clock,
  inventory: Package,
  jobs: LayoutGrid,
  config: Settings,
  styleguide: BookOpen,
}

export function ActivityLogView() {
  const { entries } = useActivity()
  const [area, setArea] = useState('all')
  const [query, setQuery] = useState('')
  const [actor, setActor] = useState('all')

  const actors = useMemo(() => {
    const map = new Map()
    entries.forEach((e) => {
      if (e.actor?.name) map.set(e.actor.name, e.actor)
    })
    return [...map.values()]
  }, [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (area !== 'all' && e.area !== area) return false
      if (actor !== 'all' && e.actor?.name !== actor) return false
      if (!q) return true
      const hay = `${e.title} ${e.detail} ${e.actor?.name} ${e.area} ${e.action}`.toLowerCase()
      return hay.includes(q)
    })
  }, [entries, area, actor, query])

  return (
    <section className="al">
      <div className="al-head">
        <div>
          <h1>
            <Activity size={18} strokeWidth={2.2} />
            Activity log
          </h1>
          <p>Every change across Dashboard, punches, inventory, reporting, and config.</p>
        </div>
        <div className="al-count mono">{filtered.length} events</div>
      </div>

      <div className="al-toolbar">
        <div className="al-search">
          <Search size={14} strokeWidth={2.2} />
          <input
            type="search"
            placeholder="Search by person, item, action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="al-select"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          aria-label="Filter by user"
        >
          <option value="all">All users</option>
          {actors.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="al-tabs" role="tablist">
        {ACTIVITY_AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            className={`al-tab${area === a.id ? ' on' : ''}`}
            aria-selected={area === a.id}
            onClick={() => setArea(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="al-list card">
        {filtered.length === 0 ? (
          <div className="al-empty">No activity matches these filters.</div>
        ) : (
          filtered.map((e) => {
            const Icon = AREA_ICON[e.area] || Activity
            const tone = activityTone(e.action)
            return (
              <article key={e.id} className="al-row">
                <div className={`al-icon ${tone}`}>
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <div className="al-main">
                  <div className="al-title-row">
                    <b>{e.title}</b>
                    <span className="al-area">{ACTIVITY_AREAS.find((a) => a.id === e.area)?.label}</span>
                  </div>
                  <p>{e.detail}</p>
                  <div className="al-meta">
                    <span className="al-user">
                      <i>{e.actor?.initials}</i>
                      {e.actor?.name}
                    </span>
                    <span className="al-dot" />
                    <time dateTime={e.at}>{formatActivityTime(e.at)}</time>
                  </div>
                </div>
                {tone === 'ok' ? (
                  <CheckCircle2 size={16} className="al-ok" strokeWidth={2.2} />
                ) : null}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
