import { ArrowUpRight } from 'lucide-react'
import { WORKSPACES } from '../data/workspaces.js'

export function HomeView({ onSelect }) {
  return (
    <div className="home">
      <div className="home-stage">
        <div className="home-grid">
          {WORKSPACES.map((ws, i) => (
            <button
              type="button"
              key={ws.id}
              className="home-card"
              style={{
                '--ws-accent': ws.accent,
                '--ws-soft': ws.accentSoft,
                '--ws-border': ws.border,
                '--ws-delay': `${i * 60}ms`,
              }}
              onClick={() => onSelect(ws.id)}
            >
              <span className="home-card-wash" aria-hidden />
              <span className="home-card-rail" aria-hidden />
              <div className="home-card-top">
                <span className="home-card-mark">{ws.short}</span>
                <ArrowUpRight className="home-card-go" size={16} strokeWidth={2.2} />
              </div>
              <span className="home-card-name">{ws.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
