/** Flat labour report — one row per employee × worked day, expandable to jobs/sub-jobs */

function parseHours(h) {
  if (!h || h === '—') return 0
  const [hh, mm] = String(h).split(':').map(Number)
  return (hh || 0) * 60 + (mm || 0)
}

function formatMinutes(min) {
  const h = Math.floor(min / 60)
  const m = Math.abs(min % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fmtRange(start, end) {
  return `${fmtShort(start)} – ${fmtShort(end)}`
}

function fmtShort(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Seed: employee-day shifts with jobs + sub-jobs (start + hours).
 * Day-off days are omitted from the grid.
 */
const SHIFT_ROWS = [
  {
    id: 'r-d1-0720',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-20',
    shiftStart: '07:58',
    shiftEnd: '16:42',
    hours: '8:44',
    productiveHours: '8:12',
    jobs: [
      {
        id: 'DEC-1043',
        title: 'Partial wrap',
        unit: 'TRL-88421',
        hours: '4:12',
        status: 'In progress',
        subJobs: [
          { id: 'SJ-1', title: 'Surface prep & clean', start: '08:05', hours: '0:45', status: 'Done' },
          { id: 'SJ-2', title: 'Side panels install', start: '08:55', hours: '1:50', status: 'Done' },
          { id: 'SJ-3', title: 'Rear doors wrap', start: '10:50', hours: '1:10', status: 'In progress' },
          { id: 'SJ-4', title: 'QA photos', start: '12:05', hours: '0:27', status: 'Pending' },
        ],
      },
      {
        id: 'DEC-1051',
        title: 'Graphics inspection',
        unit: 'TRL-88012',
        hours: '0:41',
        status: 'Verified',
        subJobs: [
          { id: 'SJ-5', title: 'Walkaround check', start: '13:10', hours: '0:25', status: 'Done' },
          { id: 'SJ-6', title: 'Photo set upload', start: '13:40', hours: '0:16', status: 'Done' },
        ],
      },
      {
        id: 'DEC-1055',
        title: 'Decal touch-up',
        unit: 'TRL-77102',
        hours: '3:19',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-7', title: 'Panel rework', start: '14:00', hours: '2:10', status: 'Done' },
          { id: 'SJ-8', title: 'Finish photos', start: '16:15', hours: '1:09', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d7-0720',
    personId: 'd9',
    person: 'Harpreet Sidhu',
    department: 'decals',
    date: '2026-07-20',
    shiftStart: '06:00',
    shiftEnd: '14:00',
    hours: '8:00',
    productiveHours: '8:00',
    jobs: [
      {
        id: 'SEC-2201',
        title: 'Yard security sweep',
        unit: 'GATE-A',
        hours: '8:00',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-9', title: 'Gate A / B rounds', start: '06:05', hours: '4:00', status: 'Done' },
          { id: 'SJ-10', title: 'Bay lock check', start: '10:10', hours: '4:00', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d1-0719',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-19',
    shiftStart: '08:02',
    shiftEnd: '16:10',
    hours: '8:08',
    productiveHours: '7:35',
    jobs: [
      {
        id: 'DEC-1048',
        title: 'Partial wrap',
        unit: 'TRL-77102',
        hours: '3:20',
        status: 'Verified',
        subJobs: [
          { id: 'SJ-11', title: 'Prep', start: '08:10', hours: '0:40', status: 'Done' },
          { id: 'SJ-12', title: 'Install', start: '08:55', hours: '2:10', status: 'Done' },
          { id: 'SJ-13', title: 'Finish / photos', start: '11:10', hours: '0:30', status: 'Done' },
        ],
      },
      {
        id: 'DEC-1049',
        title: 'Decal install',
        unit: 'TRK-4410',
        hours: '4:15',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-14', title: 'Cab doors', start: '12:00', hours: '2:00', status: 'Done' },
          { id: 'SJ-15', title: 'Hood / fenders', start: '14:10', hours: '2:15', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d2-0719',
    personId: 'd2',
    person: 'Ujwal Patel',
    department: 'decals',
    date: '2026-07-19',
    shiftStart: '07:45',
    shiftEnd: '16:30',
    hours: '8:45',
    productiveHours: '7:50',
    jobs: [
      {
        id: 'DEC-1041',
        title: 'Graphics inspection',
        unit: 'TRL-90210',
        hours: '1:05',
        status: 'Stuck',
        subJobs: [
          { id: 'SJ-16', title: 'Initial inspect', start: '08:00', hours: '0:35', status: 'Done' },
          { id: 'SJ-17', title: 'Issue log', start: '08:40', hours: '0:30', status: 'Blocked' },
        ],
      },
      {
        id: 'DEC-1042',
        title: 'Decal repair',
        unit: 'TRL-90233',
        hours: '6:45',
        status: 'Rework',
        subJobs: [
          { id: 'SJ-18', title: 'Remove failed panel', start: '09:30', hours: '2:10', status: 'Done' },
          { id: 'SJ-19', title: 'Re-apply vinyl', start: '11:50', hours: '4:35', status: 'Rework' },
        ],
      },
    ],
  },
  {
    id: 'r-d8-0719',
    personId: 'd10',
    person: 'Manveer Gill',
    department: 'decals',
    date: '2026-07-19',
    shiftStart: '09:00',
    shiftEnd: '15:30',
    hours: '6:30',
    productiveHours: '6:10',
    jobs: [
      {
        id: 'CLN-118',
        title: 'Unit cleaning',
        unit: 'TRL-88421',
        hours: '2:10',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-20', title: 'Exterior wash', start: '09:10', hours: '1:10', status: 'Done' },
          { id: 'SJ-21', title: 'Interior wipe', start: '10:25', hours: '1:00', status: 'Done' },
        ],
      },
      {
        id: 'CLN-119',
        title: 'Bay floor cleaning',
        unit: 'BAY-2',
        hours: '4:00',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-22', title: 'Sweep & degrease', start: '11:30', hours: '2:20', status: 'Done' },
          { id: 'SJ-23', title: 'Rinse / dry', start: '14:00', hours: '1:40', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d1-0718',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-18',
    shiftStart: '08:00',
    shiftEnd: '15:50',
    hours: '7:50',
    productiveHours: '7:20',
    jobs: [
      {
        id: 'DEC-1040',
        title: 'Decal install',
        unit: 'TRK-4410',
        hours: '2:50',
        status: 'Verified',
        subJobs: [
          { id: 'SJ-24', title: 'Cab doors', start: '08:10', hours: '1:20', status: 'Done' },
          { id: 'SJ-25', title: 'Hood / fenders', start: '09:40', hours: '1:30', status: 'Done' },
        ],
      },
      {
        id: 'DEC-1037',
        title: 'Partial wrap',
        unit: 'TRL-88012',
        hours: '4:30',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-26', title: 'Side install', start: '11:15', hours: '3:00', status: 'Done' },
          { id: 'SJ-27', title: 'QA', start: '14:30', hours: '1:30', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d2-0718',
    personId: 'd2',
    person: 'Ujwal Patel',
    department: 'decals',
    date: '2026-07-18',
    shiftStart: '07:50',
    shiftEnd: '16:05',
    hours: '8:15',
    productiveHours: '7:40',
    jobs: [
      {
        id: 'DEC-1039',
        title: 'Decal repair',
        unit: 'TRL-90233',
        hours: '1:35',
        status: 'Rework',
        subJobs: [
          { id: 'SJ-28', title: 'Remove failed panel', start: '08:00', hours: '0:40', status: 'Done' },
          { id: 'SJ-29', title: 'Re-apply vinyl', start: '08:45', hours: '0:55', status: 'Rework' },
        ],
      },
      {
        id: 'DEC-1036',
        title: 'Graphics inspection',
        unit: 'TRL-77102',
        hours: '6:05',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-30', title: 'Full walkaround', start: '10:00', hours: '3:00', status: 'Done' },
          { id: 'SJ-31', title: 'Report upload', start: '13:15', hours: '3:05', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d4-0717',
    personId: 'd12',
    person: 'Ravi Bains',
    department: 'decals',
    date: '2026-07-17',
    shiftStart: '08:00',
    shiftEnd: '12:00',
    hours: '4:00',
    productiveHours: '3:55',
    jobs: [
      {
        id: 'DEC-1038',
        title: 'IFTA renewal',
        unit: 'TRL-90210',
        hours: '1:55',
        status: 'Verified',
        subJobs: [
          { id: 'SJ-32', title: 'Document check', start: '08:10', hours: '0:45', status: 'Done' },
          { id: 'SJ-33', title: 'Sticker apply', start: '09:00', hours: '1:10', status: 'Done' },
        ],
      },
      {
        id: 'SEC-2190',
        title: 'Gate coverage',
        unit: 'GATE-B',
        hours: '2:00',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-34', title: 'Morning coverage', start: '10:15', hours: '2:00', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d3-0717',
    personId: 'd11',
    person: 'Simran Kaur',
    department: 'decals',
    date: '2026-07-17',
    shiftStart: '07:00',
    shiftEnd: '15:30',
    hours: '8:30',
    productiveHours: '7:45',
    jobs: [
      {
        id: 'CLN-112',
        title: 'Bay floor cleaning',
        unit: 'BAY-3',
        hours: '4:20',
        status: 'Missed punch-out',
        subJobs: [
          { id: 'SJ-35', title: 'Sweep & degrease', start: '07:10', hours: '2:30', status: 'Done' },
          { id: 'SJ-36', title: 'Rinse / dry', start: '09:50', hours: '1:50', status: 'Done' },
        ],
      },
      {
        id: 'CLN-113',
        title: 'Unit cleaning',
        unit: 'TRL-90210',
        hours: '3:25',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-37', title: 'Exterior', start: '12:00', hours: '1:45', status: 'Done' },
          { id: 'SJ-38', title: 'Interior', start: '13:50', hours: '1:40', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d1-0716',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-16',
    shiftStart: '08:05',
    shiftEnd: '16:20',
    hours: '8:15',
    productiveHours: '7:50',
    jobs: [
      {
        id: 'DEC-1035',
        title: 'Partial wrap',
        unit: 'TRL-88421',
        hours: '7:50',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-39', title: 'Prep', start: '08:15', hours: '1:00', status: 'Done' },
          { id: 'SJ-40', title: 'Install', start: '09:20', hours: '5:30', status: 'Done' },
          { id: 'SJ-41', title: 'QA photos', start: '15:00', hours: '1:20', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d1-0715',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-15',
    shiftStart: '07:55',
    shiftEnd: '16:00',
    hours: '8:05',
    productiveHours: '7:40',
    jobs: [
      {
        id: 'DEC-1034',
        title: 'Decal print',
        unit: '—',
        hours: '5:00',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-42', title: 'File prep', start: '08:00', hours: '0:40', status: 'Done' },
          { id: 'SJ-43', title: 'Print run', start: '08:50', hours: '4:20', status: 'Done' },
        ],
      },
      {
        id: 'DEC-1033',
        title: 'Graphics inspection',
        unit: 'TRL-88012',
        hours: '2:40',
        status: 'Verified',
        subJobs: [
          { id: 'SJ-44', title: 'Inspect', start: '13:20', hours: '1:40', status: 'Done' },
          { id: 'SJ-45', title: 'Photos', start: '15:05', hours: '1:00', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d1-0714',
    personId: 'd1',
    person: 'Adarsh Verma',
    department: 'decals',
    date: '2026-07-14',
    shiftStart: '08:00',
    shiftEnd: '—',
    hours: '31:04',
    productiveHours: '1:00',
    jobs: [
      {
        id: 'DEC-1053',
        title: 'Decal print',
        unit: '—',
        hours: '31:04',
        status: 'Stuck 31h',
        subJobs: [
          { id: 'SJ-46', title: 'File prep', start: '08:10', hours: '0:20', status: 'Done' },
          { id: 'SJ-47', title: 'Print queue', start: '08:35', hours: '30:44', status: 'Stuck' },
        ],
      },
    ],
  },
  {
    id: 'r-d2-0716',
    personId: 'd2',
    person: 'Ujwal Patel',
    department: 'decals',
    date: '2026-07-16',
    shiftStart: '08:10',
    shiftEnd: '16:40',
    hours: '8:30',
    productiveHours: '8:05',
    jobs: [
      {
        id: 'DEC-1032',
        title: 'Partial wrap',
        unit: 'TRL-90233',
        hours: '8:05',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-48', title: 'Full side wrap', start: '08:20', hours: '6:00', status: 'Done' },
          { id: 'SJ-49', title: 'Finish', start: '14:30', hours: '2:05', status: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'r-d8-0717',
    personId: 'd10',
    person: 'Manveer Gill',
    department: 'decals',
    date: '2026-07-17',
    shiftStart: '09:00',
    shiftEnd: '14:00',
    hours: '5:00',
    productiveHours: '4:45',
    jobs: [
      {
        id: 'CLN-110',
        title: 'Unit cleaning',
        unit: 'TRL-77102',
        hours: '4:45',
        status: 'Complete',
        subJobs: [
          { id: 'SJ-50', title: 'Wash', start: '09:10', hours: '2:30', status: 'Done' },
          { id: 'SJ-51', title: 'Dry / detail', start: '11:50', hours: '2:15', status: 'Done' },
        ],
      },
    ],
  },
]

function addMinutes(time, mins) {
  if (!time || time === '—') return '—'
  const [hh, mm] = time.split(':').map(Number)
  const total = (hh || 0) * 60 + (mm || 0) + mins
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function enrichJob(job) {
  const subs = job.subJobs || []
  const start = job.start || subs[0]?.start || '—'
  let end = job.end
  if (!end && subs.length) {
    const last = subs[subs.length - 1]
    end = addMinutes(last.start, parseHours(last.hours))
  }
  return {
    ...job,
    start,
    end: end || '—',
    hours: job.hours || formatMinutes(subs.reduce((n, s) => n + parseHours(s.hours), 0)),
  }
}

function punchAlerts(row) {
  const alerts = []
  if (!row.shiftStart || row.shiftStart === '—') alerts.push('Missing punch-in')
  if (!row.shiftEnd || row.shiftEnd === '—') alerts.push('Missing punch-out')
  return alerts
}

export function buildJobReport({
  personId = 'all',
  department = 'decals',
  start = '2026-07-07',
  end = '2026-07-20',
} = {}) {
  const rows = SHIFT_ROWS.filter((r) => {
    if (start && r.date < start) return false
    if (end && r.date > end) return false
    if (personId !== 'all' && r.personId !== personId) return false
    if (department !== 'all' && r.department !== department) return false
    return true
  })
    .map((r) => {
      const jobs = (r.jobs || []).map(enrichJob)
      const jobCount = jobs.length
      const subJobCount = jobs.reduce((n, j) => n + (j.subJobs?.length || 0), 0)
      const alerts = punchAlerts(r)
      return {
        ...r,
        jobs,
        dateLabel: fmtDate(r.date),
        jobCount,
        subJobCount,
        alerts,
      }
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return a.person.localeCompare(b.person)
    })

  const totalJobs = rows.reduce((n, r) => n + r.jobCount, 0)
  const totalHours = rows.reduce((n, r) => n + parseHours(r.hours), 0)
  const totalProductive = rows.reduce((n, r) => n + parseHours(r.productiveHours), 0)
  const alertCount = rows.filter((r) => r.alerts.length).length

  return {
    rows,
    summary: {
      rows: rows.length,
      jobs: totalJobs,
      hours: formatMinutes(totalHours),
      productiveHours: formatMinutes(totalProductive),
      alertCount,
      rangeLabel: fmtRange(start, end),
    },
  }
}
