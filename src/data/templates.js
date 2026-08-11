/** Installation templates — trucks & trailers by equipment and country. */

const PHOTO_FULL = {
  beforeRequired: true,
  afterRequired: true,
  afterEachSection: true,
  note: 'Before photos prior to install. After photos for each section and a final set when complete.',
}

function trailerSections(opts = {}) {
  const { axle = true, reefer = false, heater = false } = opts
  const sections = [
    {
      id: 'back-doors',
      title: 'Back Doors',
      photoAfter: true,
      items: [
        'Charger Logistics Logo',
        'www.chargerlogistics.com',
        'Hiring / QR Code Decal',
        'drive4charger.com',
        'Reflective Unit Number XX0000',
        'Caution Wide Right Turns',
        'Stop / Safety Decal',
      ],
    },
    {
      id: 'front-wall',
      title: 'Front Wall / Front Door',
      photoAfter: true,
      items: [
        'Charger Logistics Logo',
        'Reflective Unit Number XX0000',
        'Left Vertical Unit Number XX0000',
        'Right Vertical Unit Number XX0000',
        'Caution 13\'6" High',
        'Stop / Safety Decal',
      ],
    },
    {
      id: 'side',
      title: 'Side',
      photoAfter: true,
      items: [
        "53' Trailer Length Decal",
        'chargerlogistics.com',
        'Stop / Safety Decal',
      ],
    },
  ]

  if (axle) {
    sections.push({
      id: 'rear-axle',
      title: 'Rear Axle / Side',
      photoAfter: true,
      items: [
        'California Middle of Rear Axle Decal',
        '40" Axle Marking',
        '41" Axle Marking',
      ],
    })
  }

  if (reefer) {
    sections.push({
      id: 'reefer-unit',
      title: 'Reefer Unit',
      photoAfter: true,
      items: [
        'Reefer brand / model plate area clear',
        'Charger Logistics reefer side mark',
        'Fuel / power caution labels',
      ],
    })
  }

  if (heater) {
    sections.push({
      id: 'heater',
      title: 'Heater Package',
      photoAfter: true,
      items: [
        'Heater unit marking',
        'Fuel line caution labels',
        'Exhaust clearance labels',
      ],
    })
  }

  sections.push({
    id: 'inside-doors',
    title: 'Inside Doors',
    photoAfter: true,
    items: [
      'Inside decals — door panels',
      'Inside safety / instruction decals',
      'Unit number (interior reference)',
    ],
  })

  return sections
}

function truckSections(opts = {}) {
  const { dayCab = false } = opts
  return [
    {
      id: 'doors',
      title: dayCab ? 'Cab Doors' : 'Doors / Fairings',
      photoAfter: true,
      items: [
        'Charger Logistics Logo',
        'Unit number (door)',
        'Hiring / QR Code Decal',
        'drive4charger.com',
      ],
    },
    {
      id: 'hood',
      title: 'Hood / Bumper',
      photoAfter: true,
      items: [
        'Charger Logistics Logo (hood)',
        'US DOT number sticker',
        'MC / MX authority sticker (if required)',
        'Bump / grill safety marks',
      ],
    },
    {
      id: 'sides',
      title: 'Sides',
      photoAfter: true,
      items: [
        'Company name — Charger Logistics',
        'www.chargerlogistics.com',
        'Reflective conspicuity tape check',
      ],
    },
    {
      id: 'rear',
      title: 'Rear',
      photoAfter: true,
      items: [
        'Mudflap logos',
        'Rear unit number',
        'Stop / Safety Decal',
      ],
    },
  ]
}

export const EQUIPMENT_TYPES = {
  trailer: [
    { id: 'dry-van', label: 'Dry van' },
    { id: 'reefer', label: 'Reefer' },
    { id: 'heater', label: 'Heater' },
  ],
  truck: [
    { id: 'highway', label: 'Highway truck' },
    { id: 'day-cab', label: 'Day cab' },
  ],
}

export const INSTALL_TEMPLATES = [
  {
    id: 'trl-ca-dry',
    type: 'trailer',
    equipment: 'dry-van',
    country: 'Canada',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-DRY-CA',
    name: 'Dry van installation — Canada',
    status: 'active',
    estMinutes: 240,
    summary: 'Full marking package for new Canada dry van trailers.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: false }),
  },
  {
    id: 'trl-us-dry',
    type: 'trailer',
    equipment: 'dry-van',
    country: 'USA',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-DRY-US',
    name: 'Dry van installation — USA',
    status: 'active',
    estMinutes: 255,
    summary: 'USA dry van package including CA axle markings.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: true }),
  },
  {
    id: 'trl-ca-reefer',
    type: 'trailer',
    equipment: 'reefer',
    country: 'Canada',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-REF-CA',
    name: 'Reefer installation — Canada',
    status: 'active',
    estMinutes: 270,
    summary: 'Dry van markings plus reefer unit labels.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: false, reefer: true }),
  },
  {
    id: 'trl-us-reefer',
    type: 'trailer',
    equipment: 'reefer',
    country: 'USA',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-REF-US',
    name: 'Reefer installation — USA',
    status: 'active',
    estMinutes: 285,
    summary: 'USA reefer package with axle and unit markings.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: true, reefer: true }),
  },
  {
    id: 'trl-ca-heater',
    type: 'trailer',
    equipment: 'heater',
    country: 'Canada',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-HTR-CA',
    name: 'Heater trailer installation — Canada',
    status: 'active',
    estMinutes: 260,
    summary: 'Trailer package with heater unit safety markings.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: false, heater: true }),
  },
  {
    id: 'trl-us-heater',
    type: 'trailer',
    equipment: 'heater',
    country: 'USA',
    company: 'Charger Logistics',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-HTR-US',
    name: 'Heater trailer installation — USA',
    status: 'active',
    estMinutes: 275,
    summary: 'USA heater trailer package with axle markings.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: true, heater: true }),
  },
  {
    id: 'trk-us-hwy',
    type: 'truck',
    equipment: 'highway',
    country: 'USA',
    company: 'Charger Logistics',
    unitLabel: 'Truck',
    usDot: 'USDOT 2345678',
    code: 'TRK-HWY-US',
    name: 'Highway truck install — USA',
    status: 'active',
    estMinutes: 210,
    summary: 'Highway tractor markings including required US DOT stickers.',
    photoPolicy: PHOTO_FULL,
    sections: truckSections(),
  },
  {
    id: 'trk-ca-hwy',
    type: 'truck',
    equipment: 'highway',
    country: 'Canada',
    company: 'Charger Logistics',
    unitLabel: 'Truck',
    usDot: 'USDOT 2345678',
    code: 'TRK-HWY-CA',
    name: 'Highway truck install — Canada',
    status: 'active',
    estMinutes: 200,
    summary: 'Canada highway tractor package; US DOT applied when operating into the US.',
    photoPolicy: PHOTO_FULL,
    sections: truckSections(),
  },
  {
    id: 'trk-us-day',
    type: 'truck',
    equipment: 'day-cab',
    country: 'USA',
    company: 'Charger Logistics',
    unitLabel: 'Truck',
    usDot: 'USDOT 2345678',
    code: 'TRK-DAY-US',
    name: 'Day cab install — USA',
    status: 'active',
    estMinutes: 180,
    summary: 'Day cab tractor markings with US DOT number stickers.',
    photoPolicy: PHOTO_FULL,
    sections: truckSections({ dayCab: true }),
  },
  {
    id: 'trl-drive-dry',
    type: 'trailer',
    equipment: 'dry-van',
    country: 'Canada',
    company: 'Drive',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-DRIVE-CA',
    name: 'Drive dry van installation — Canada',
    status: 'active',
    estMinutes: 230,
    summary: 'Drive dry van marking package for Canada trailers.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: false }),
  },
  {
    id: 'trl-reefer-co',
    type: 'trailer',
    equipment: 'reefer',
    country: 'USA',
    company: 'Reefer',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-REF-CO',
    name: 'Reefer company install — USA',
    status: 'active',
    estMinutes: 280,
    summary: 'Reefer trailer marking package with unit labels.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: true, reefer: true }),
  },
  {
    id: 'trl-ts-dry',
    type: 'trailer',
    equipment: 'dry-van',
    country: 'Canada',
    company: 'TS Trucking',
    unitLabel: 'Trailer',
    usDot: null,
    code: 'TRL-TS-CA',
    name: 'TS Trucking dry van — Canada',
    status: 'active',
    estMinutes: 235,
    summary: 'TS Trucking dry van install checklist.',
    photoPolicy: PHOTO_FULL,
    sections: trailerSections({ axle: false }),
  },
  {
    id: 'trk-ts-day',
    type: 'truck',
    equipment: 'day-cab',
    country: 'Canada',
    company: 'TS Trucking',
    unitLabel: 'Truck',
    usDot: 'USDOT 1099332',
    code: 'TRK-TS-CA',
    name: 'TS Trucking day cab — Canada',
    status: 'active',
    estMinutes: 185,
    summary: 'TS Trucking day cab tractor markings.',
    photoPolicy: PHOTO_FULL,
    sections: truckSections({ dayCab: true }),
  },
  {
    id: 'trk-drive-hwy',
    type: 'truck',
    equipment: 'highway',
    country: 'USA',
    company: 'Drive',
    unitLabel: 'Truck',
    usDot: 'USDOT 2789012',
    code: 'TRK-DRIVE-US',
    name: 'Drive highway truck — USA',
    status: 'active',
    estMinutes: 205,
    summary: 'Drive highway tractor marking package.',
    photoPolicy: PHOTO_FULL,
    sections: truckSections(),
  },
]

/** @deprecated use INSTALL_TEMPLATES */
export const TRAILER_INSTALL_TEMPLATES = INSTALL_TEMPLATES.filter((t) => t.type === 'trailer')

export function equipmentLabel(type, equipmentId) {
  return EQUIPMENT_TYPES[type]?.find((e) => e.id === equipmentId)?.label || equipmentId
}
