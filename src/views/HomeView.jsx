import { WORKSPACES } from '../data/workspaces.js'

export function HomeView({ onSelect }) {
  return (
    <div className="home">
      <div className="home-grid">
        {WORKSPACES.map((ws) => (
          <button
            type="button"
            key={ws.id}
            className="home-card"
            style={{
              '--ws-accent': ws.accent,
              '--ws-soft': ws.accentSoft,
              '--ws-border': ws.border,
            }}
            onClick={() => onSelect(ws.id)}
          >
            <i className="home-card-dot" aria-hidden />
            <span className="home-card-name">{ws.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
