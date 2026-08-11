import { Chip } from '../components/ui.jsx'
import { getWorkspace, getWorkspacePeople } from '../data/workspaces.js'

export function WorkspaceDashboard({ workspaceId }) {
  const ws = getWorkspace(workspaceId)
  const people = getWorkspacePeople(workspaceId)

  if (!ws) return null

  return (
    <section className="page workspace-page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ color: ws.accent }}>
            {ws.short} · Workspace
          </div>
          <h1>{ws.label}</h1>
          <p className="page-sub">{ws.tagline}</p>
        </div>
        <div className="page-meta">{ws.periodLabel}</div>
      </div>

      <div className="ws-kpis">
        <div className="ws-kpi" style={{ '--ws-accent': ws.accent, '--ws-soft': ws.accentSoft }}>
          <span>People</span>
          <b className="num">{ws.people}</b>
          <em>Active this period</em>
        </div>
        <div className="ws-kpi" style={{ '--ws-accent': ws.accent, '--ws-soft': ws.accentSoft }}>
          <span>On shift</span>
          <b className="num">{ws.onShift}</b>
          <em>Clocked in now</em>
        </div>
        <div className="ws-kpi" style={{ '--ws-accent': ws.accent, '--ws-soft': ws.accentSoft }}>
          <span>Open jobs</span>
          <b className="num">{ws.openJobs}</b>
          <em>Need assignment or close</em>
        </div>
        <div className="ws-kpi" style={{ '--ws-accent': ws.accent, '--ws-soft': ws.accentSoft }}>
          <span>Exceptions</span>
          <b className="num">{ws.exceptions}</b>
          <em>Punch / review blockers</em>
        </div>
      </div>

      <div className="ws-focus-row">
        {ws.focus.map((f) => (
          <span key={f} className="ws-focus-chip" style={{ borderColor: ws.border, background: ws.accentSoft, color: ws.accent }}>
            {f}
          </span>
        ))}
      </div>

      <div className="card table-card">
        <div className="ws-table-head">
          <b>{ws.label} crew</b>
          <span>{people.length} shown · sample roster</span>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {people.map((emp) => (
              <tr className="data" key={emp.id}>
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
                <td className="num mono">{emp.util}%</td>
                <td className="num mono">{emp.jobs}</td>
                <td>
                  <Chip tone={emp.status.tone}>{emp.status.label}</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
