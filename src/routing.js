import { WORKSPACES } from './data/workspaces.js'

const WORKSPACE_IDS = new Set(WORKSPACES.map((w) => w.id))

/** Internal view id → URL segment (payroll is the workspace root). */
const VIEW_TO_SEGMENT = {
  payroll: null,
  jobs: 'reporting',
  visitors: 'visitors',
  inventory: 'inventory',
  activity: 'activity',
  styleguide: 'styleguide',
  config: 'config',
  person: 'person',
}

const SEGMENT_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_TO_SEGMENT)
    .filter(([, seg]) => seg)
    .map(([view, seg]) => [seg, view]),
)

export function buildPath({ workspaceId, view = 'payroll', personId = null }) {
  if (!workspaceId) return '/'
  const parts = [workspaceId]
  if (view === 'person' && personId) {
    parts.push('person', encodeURIComponent(personId))
  } else {
    const seg = VIEW_TO_SEGMENT[view]
    if (seg) parts.push(seg)
  }
  return `/${parts.join('/')}`
}

export function parsePath(pathname = window.location.pathname) {
  const raw = pathname.replace(/\/+$/, '') || '/'
  if (raw === '/' || raw === '') {
    return { workspaceId: null, view: 'payroll', personId: null }
  }

  const parts = raw.split('/').filter(Boolean)
  const workspaceId = parts[0]
  if (!WORKSPACE_IDS.has(workspaceId)) {
    return { workspaceId: null, view: 'payroll', personId: null }
  }

  if (parts[1] === 'person' && parts[2]) {
    return {
      workspaceId,
      view: 'person',
      personId: decodeURIComponent(parts[2]),
    }
  }

  const segment = parts[1]
  if (!segment) {
    return { workspaceId, view: 'payroll', personId: null }
  }

  const view = SEGMENT_TO_VIEW[segment]
  if (!view) {
    return { workspaceId, view: 'payroll', personId: null }
  }

  return { workspaceId, view, personId: null }
}

export function pageTitle({ workspaceId, view = 'payroll', personName }) {
  if (!workspaceId) return 'Backdash'
  const ws = WORKSPACES.find((w) => w.id === workspaceId)
  const label = ws?.label || workspaceId
  if (view === 'person' && personName) return `${personName} · ${label} · Backdash`
  const viewLabel =
    {
      payroll: 'Dashboard',
      jobs: 'Reporting',
      visitors: 'Visitors',
      inventory: 'Inventory',
      activity: 'Activity log',
      styleguide: 'Style guide',
      config: 'Configuration',
    }[view] || null
  return viewLabel ? `${viewLabel} · ${label} · Backdash` : `${label} · Backdash`
}
