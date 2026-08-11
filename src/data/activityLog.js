/** Global activity feed — payroll, punches, inventory, jobs, config. */

export const CURRENT_ACTOR = {
  id: 'admin',
  name: 'Arshdeep Singh',
  initials: 'AS',
  role: 'Payroll admin',
}

export const ACTIVITY_AREAS = [
  { id: 'all', label: 'All' },
  { id: 'payroll', label: 'Dashboard' },
  { id: 'punch', label: 'Punches' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'jobs', label: 'Reporting' },
  { id: 'config', label: 'Configuration' },
  { id: 'styleguide', label: 'Style guide' },
]

function ago(mins) {
  const d = new Date()
  d.setMinutes(d.getMinutes() - mins)
  return d.toISOString()
}

export const INITIAL_ACTIVITY = [
  {
    id: 'act-1',
    at: ago(12),
    area: 'inventory',
    action: 'stock_in',
    title: 'Added rolls',
    detail: '3M 180mC Gloss White · +12 rolls · Canada',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { sku: '3M-180MC-W', qty: 12 },
  },
  {
    id: 'act-2',
    at: ago(38),
    area: 'punch',
    action: 'punch_out',
    title: 'Resolved missed punch-out',
    detail: 'Adarsh Verma · Jul 20 · punch-out set to 15:56 · FORGOT_PUNCH_OUT',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { person: 'Adarsh Verma' },
  },
  {
    id: 'act-3',
    at: ago(95),
    area: 'payroll',
    action: 'approve',
    title: 'Approved timesheet',
    detail: 'Kamal Dhillon · OT none · period Jul 7 – 20',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { person: 'Kamal Dhillon', otApproved: false },
  },
  {
    id: 'act-4',
    at: ago(140),
    area: 'inventory',
    action: 'stock_out',
    title: 'Used rolls',
    detail: 'Avery MPI 1105 · −4 rolls · Job DEC-1061',
    actor: { name: 'Ujwal Patel', initials: 'UP' },
    meta: { sku: 'AV-MPI-1105', qty: 4 },
  },
  {
    id: 'act-5',
    at: ago(210),
    area: 'jobs',
    action: 'punch_edit',
    title: 'Corrected shift punches',
    detail: 'Navjot Singh · Jul 18 · in 06:00 · out 14:30',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { person: 'Navjot Singh' },
  },
  {
    id: 'act-6',
    at: ago(320),
    area: 'payroll',
    action: 'approve_ot',
    title: 'Approved overtime',
    detail: 'Ujwal Patel · OT 6:05 approved · period Jul 7 – 20',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { person: 'Ujwal Patel', ot: '6:05' },
  },
  {
    id: 'act-7',
    at: ago(480),
    area: 'inventory',
    action: 'invoice',
    title: 'Attached invoice',
    detail: 'INV-4821 · Avery Dennison · $1,240.00',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { invoice: 'INV-4821' },
  },
  {
    id: 'act-8',
    at: ago(620),
    area: 'config',
    action: 'template',
    title: 'Updated photo checklist',
    detail: 'Trailer · Dry van · Charger Logistics',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
  },
  {
    id: 'act-9',
    at: ago(900),
    area: 'styleguide',
    action: 'view',
    title: 'Downloaded style PDF',
    detail: 'USDOT · Charger Logistics',
    actor: { name: 'Kamal Dhillon', initials: 'KD' },
  },
  {
    id: 'act-10',
    at: ago(1100),
    area: 'punch',
    action: 'punch_in',
    title: 'Manual punch-in recorded',
    detail: 'Adarsh Verma · Jul 20 · 06:52 · SUPERVISOR_CORRECTION',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
    meta: { person: 'Adarsh Verma' },
  },
  {
    id: 'act-11',
    at: ago(1400),
    area: 'inventory',
    action: 'new_item',
    title: 'Created inventory item',
    detail: 'Oracal 751 · Matte Black · opening 8 rolls',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
  },
  {
    id: 'act-12',
    at: ago(1800),
    area: 'jobs',
    action: 'create_job',
    title: 'Created job',
    detail: 'DEC-1066 · IFTA renewal · TRL-77201',
    actor: { name: 'Arshdeep Singh', initials: 'AS' },
  },
]

export function formatActivityTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.round((now - d) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function activityTone(action) {
  if (['approve', 'approve_ot', 'punch_out', 'invoice'].includes(action)) return 'ok'
  if (['stock_out', 'punch_edit'].includes(action)) return 'warn'
  if (['stock_in', 'new_item', 'create_job', 'punch_in', 'template'].includes(action))
    return 'info'
  return 'muted'
}
