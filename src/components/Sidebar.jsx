import {
  LayoutDashboard,
  LayoutGrid,
  Settings,
  BookOpen,
  Package,
  Activity,
  PanelLeftClose,
  PanelLeft,
  Users,
} from 'lucide-react'

const DECALS_NAV = [
  { id: 'payroll', label: 'Dashboard', icon: LayoutDashboard, badge: 4 },
  { id: 'jobs', label: 'Reporting', icon: LayoutGrid, badge: 7 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'activity', label: 'Activity log', icon: Activity },
  { id: 'styleguide', label: 'Style guide', icon: BookOpen },
  { id: 'config', label: 'Configuration', icon: Settings },
]

const SECURITY_NAV = [
  { id: 'payroll', label: 'Dashboard', icon: LayoutDashboard, badge: 3 },
  { id: 'visitors', label: 'Visitors', icon: Users, badge: 6 },
  { id: 'jobs', label: 'Reporting', icon: LayoutGrid },
  { id: 'config', label: 'Configuration', icon: Settings },
  { id: 'activity', label: 'Activity log', icon: Activity },
]

const OTHER_NAV = [
  { id: 'payroll', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Jobs board', icon: LayoutGrid },
  { id: 'activity', label: 'Activity log', icon: Activity },
]

export function Sidebar({
  view,
  onNavigate,
  collapsed,
  onToggle,
  workspaceLabel = 'Decals',
  onHome,
  workspaceId = 'decals',
}) {
  const active = view === 'person' ? 'payroll' : view
  const items =
    workspaceId === 'decals'
      ? DECALS_NAV
      : workspaceId === 'security'
        ? SECURITY_NAV
        : OTHER_NAV

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="brand">
        {!collapsed && <div className="brand-name">{workspaceLabel}</div>}
        <button
          className="sb-toggle"
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {!collapsed ? (
        <button type="button" className="sb-home" onClick={onHome}>
          <LayoutGrid size={14} strokeWidth={2.2} />
          All workspaces
        </button>
      ) : (
        <button
          type="button"
          className="nav-item sb-home-icon"
          onClick={onHome}
          title="All workspaces"
        >
          <LayoutGrid size={15} strokeWidth={2} />
        </button>
      )}

      {!collapsed && <div className="nav-label">Menu</div>}
      {items.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          type="button"
          className={`nav-item${active === id ? ' active' : ''}`}
          onClick={() => onNavigate(id)}
          title={label}
        >
          <Icon size={15} strokeWidth={2} />
          <span className="nav-lbl">{label}</span>
          {badge ? <span className="nb">{badge}</span> : null}
        </button>
      ))}
      <div className="sidebar-foot">
        <div className="avatar">AS</div>
        <div className="sf-meta">
          <div className="sf-name">Arshdeep Singh</div>
          <div className="sf-role">Payroll admin</div>
          <div className="sf-phone">+1 (905) 555-0142</div>
        </div>
      </div>
    </aside>
  )
}
