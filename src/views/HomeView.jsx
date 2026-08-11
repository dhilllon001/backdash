import { Shield, Sticker, HardHat, Truck } from 'lucide-react'
import { WORKSPACES } from '../data/workspaces.js'

const ICONS = {
  security: Shield,
  decals: Sticker,
  construction: HardHat,
  toe: Truck,
}

export function HomeView({ onSelect }) {
  return (
    <div className="home">
      <div className="home-stage">
        <header className="home-head">
          <h1>Welcome back</h1>
          <p>Select an application to continue</p>
        </header>

        <div className="home-grid">
          {WORKSPACES.map((ws) => {
            const Icon = ICONS[ws.id] || Sticker
            const metricValue = ws.exceptions ?? ws.openJobs ?? 0
            const metricLabel =
              ws.id === 'decals' || ws.id === 'security'
                ? 'Waiting for approval'
                : ws.id === 'construction'
                  ? 'Open jobs'
                  : 'On shift'
            const metricShown =
              ws.id === 'toe' ? ws.onShift : ws.id === 'construction' ? ws.openJobs : metricValue

            return (
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
                <div className="home-card-accent" aria-hidden />
                <div className="home-card-body">
                  <div className="home-card-title-row">
                    <span className="home-card-icon">
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <span className="home-card-name">{ws.label}</span>
                  </div>
                  <p className="home-card-desc">{ws.tagline}</p>
                  <div className="home-card-metric">
                    <b className="num">{metricShown}</b>
                    <span>{metricLabel}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
