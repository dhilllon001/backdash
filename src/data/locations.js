/** Brampton-area mock GPS trail helpers */

export const YARD_ADDR = {
  Brampton: {
    address: '25 Regan Rd, Brampton, ON L7A 1B2',
    lat: 43.73152,
    lng: -79.76241,
  },
  Laredo: {
    address: '5100 Santa Maria Ave, Laredo, TX 78041',
    lat: 27.5301,
    lng: -99.4803,
  },
}

const BRAMPTON_SPOTS = [
  { address: '25 Regan Rd, Brampton, ON L7A 1B2', lat: 43.73152, lng: -79.76241 },
  { address: '18 Commercial Rd, Brampton, ON L6T 3Y1', lat: 43.7158, lng: -79.6902 },
  { address: '200 Intermodal Dr, Brampton, ON L6T 5R3', lat: 43.7491, lng: -79.6618 },
  { address: '44 Steeles Ave E, Brampton, ON L6W 1C9', lat: 43.6684, lng: -79.7381 },
  { address: '8 Automatic Rd, Brampton, ON L6S 5N3', lat: 43.7246, lng: -79.6874 },
  { address: '100 Kennedy Rd S, Brampton, ON L6W 3E7', lat: 43.6779, lng: -79.7375 },
]

function spot(i) {
  return BRAMPTON_SPOTS[i % BRAMPTON_SPOTS.length]
}

/** Build a location timeline from clock-in → clock-out for a shift */
export function buildLocationPings(shift) {
  if (shift.dayOff) return []
  if (shift.pings?.length) return shift.pings

  const yard = YARD_ADDR[shift.yard] || YARD_ADDR.Brampton
  const day = shift.date || '2026-07-20'
  const pings = []

  if (shift.in) {
    pings.push({
      id: `${shift.id}-in`,
      type: 'clock_in',
      label: 'Clocked in',
      time: shift.in,
      timestamp: `${day}T${shift.in}:00`,
      ...yard,
    })
  }

  ;(shift.jobs || []).forEach((job, i) => {
    const s = spot(i + 1)
    if (job.start) {
      pings.push({
        id: `${shift.id}-${job.id}-start`,
        type: 'job_start',
        label: `Started ${job.title}`,
        time: job.start,
        timestamp: `${day}T${job.start}:00`,
        jobId: job.id,
        ...s,
      })
    }
    if (job.end) {
      const e = spot(i + 2)
      pings.push({
        id: `${shift.id}-${job.id}-end`,
        type: 'job_end',
        label: `Finished ${job.title}`,
        time: job.end,
        timestamp: `${day}T${job.end}:00`,
        jobId: job.id,
        ...e,
      })
    }
  })

  // Mid-shift movement samples
  if (shift.in && !shift.open) {
    const mid = spot(3)
    pings.push({
      id: `${shift.id}-mid`,
      type: 'ping',
      label: 'Location ping',
      time: '12:14',
      timestamp: `${day}T12:14:00`,
      ...mid,
    })
  } else if (shift.open) {
    const mid = spot(2)
    pings.push({
      id: `${shift.id}-live`,
      type: 'ping',
      label: 'Latest ping',
      time: '15:42',
      timestamp: `${day}T15:42:00`,
      ...mid,
    })
  }

  if (shift.out) {
    pings.push({
      id: `${shift.id}-out`,
      type: 'clock_out',
      label: 'Clocked out',
      time: shift.out,
      timestamp: `${day}T${shift.out}:00`,
      ...yard,
    })
  }

  return pings.sort((a, b) => String(a.time).localeCompare(String(b.time)))
}

export function clockInLocation(shift) {
  const pings = buildLocationPings(shift)
  return pings.find((p) => p.type === 'clock_in') || pings[0] || null
}
