import {
  Users,
  LayoutGrid,
  UserPlus,
  Truck,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

const NAV = [
  { id: 'payroll', label: 'Labour & Payroll', icon: Users, badge: 4 },
  { id: 'jobs', label: 'Jobs board', icon: LayoutGrid, badge: 7 },
  { id: 'assign', label: 'Assign work', icon: UserPlus },
  { id: 'units', label: 'By unit', icon: Truck },
  { id: 'config', label: 'Configuration', icon: Settings },
]

export function Sidebar({ view, onNavigate, collapsed, onToggle }) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="brand">
        {!collapsed && <div className="brand-name">Backdash</div>}
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
      {!collapsed && <div className="nav-label">Menu</div>}
      {NAV.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          type="button"
          className={`nav-item${view === id ? ' active' : ''}`}
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
