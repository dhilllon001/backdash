import { ArrowRight, Shield, Sticker, HardHat, Truck } from 'lucide-react'
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
      <header className="home-top">
        <div className="home-brand">
          <span className="home-mark">CF</span>
          <div>
            <b>ChargerFleet</b>
            <span>Labour · Jobs · Payroll</span>
          </div>
        </div>
        <div className="home-period">Pay period Jul 7 – 20, 2026</div>
      </header>

      <main className="home-main">
        <div className="home-intro">
          <h1>Choose a workspace</h1>
          <p>Open Security, Decals, Construction, or Toe jobs to manage people, punches, and jobs.</p>
        </div>

        <div className="home-grid">
          {WORKSPACES.map((ws) => {
            const Icon = ICONS[ws.id] || Sticker
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
                <div className="home-card-top">
                  <span className="home-card-icon">
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="home-card-code mono">{ws.short}</span>
                </div>
                <h2>{ws.label}</h2>
                <p>{ws.tagline}</p>

                <div className="home-card-stats">
                  <div>
                    <span>People</span>
                    <b className="num">{ws.people}</b>
                  </div>
                  <div>
                    <span>On shift</span>
                    <b className="num">{ws.onShift}</b>
                  </div>
                  <div>
                    <span>Open jobs</span>
                    <b className="num">{ws.openJobs}</b>
                  </div>
                  <div>
                    <span>Exceptions</span>
                    <b className="num">{ws.exceptions}</b>
                  </div>
                </div>

                <ul className="home-card-focus">
                  {ws.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <div className="home-card-cta">
                  Open {ws.label}
                  <ArrowRight size={15} strokeWidth={2.2} />
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
