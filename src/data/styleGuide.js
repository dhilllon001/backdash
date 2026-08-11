/** Style guide catalog — trucks & trailers by company, equipment, compliance numbers */

export const SG_EQUIPMENT = {
  trucks: [
    { id: 'all', label: 'All' },
    { id: 'highway', label: 'Highway truck' },
    { id: 'day-cab', label: 'Day cab' },
  ],
  trailers: [
    { id: 'all', label: 'All' },
    { id: 'dry-van', label: 'Dry van' },
    { id: 'reefer', label: 'Reefer' },
    { id: 'heater', label: 'Heater' },
  ],
}

export const STYLE_GUIDE = {
  trucks: [
    {
      id: 'charger',
      name: 'Charger Logistics',
      company: 'Charger Logistics',
      equipment: ['highway', 'day-cab'],
      region: 'Canada / USA',
      description: 'Truck stencil package and size guide for Charger fleet.',
      numbers: {
        usDot: 'USDOT 2345678',
        svor: 'SVOR 4521-CA',
        mcdot: 'MC 987654',
      },
      files: [
        {
          id: 'charger-2024',
          label: 'Charger 2024',
          type: 'pdf',
          file: '/style-guides/trucks/charger-2024.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/CHARGER 2024.pdf',
        },
        {
          id: 'charger-usa',
          label: 'Charger USA truck size',
          type: 'pdf',
          file: '/style-guides/trucks/charger-usa.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/CHARGER USA TRUCK SIZE.pdf',
        },
      ],
    },
    {
      id: 'baja',
      name: 'Baja',
      company: 'Baja',
      equipment: ['highway', 'day-cab'],
      region: 'USA',
      description: 'Baja 2024 stencil package and day-cab truck info.',
      numbers: {
        usDot: 'USDOT 3124980',
        svor: '—',
        mcdot: 'MC 445210',
      },
      files: [
        {
          id: 'baja-2024',
          label: 'Baja 2024',
          type: 'pdf',
          file: '/style-guides/trucks/baja-2024.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/BAJA 2024.pdf',
        },
        {
          id: 'baja-day-cab',
          label: 'Baja truck info — Day Cab',
          type: 'pdf',
          file: '/style-guides/trucks/baja-day-cab.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/BAJA TRUCK INFO DAY CAB.pdf',
        },
        {
          id: 'baja-preview',
          label: 'Baja Peterbilt preview',
          type: 'image',
          file: '/style-guides/trucks/baja-preview.jpg',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/baja PETERBELT.jpg',
        },
      ],
    },
    {
      id: 'aceway',
      name: 'Aceway',
      company: 'Aceway',
      equipment: ['highway'],
      region: 'Canada',
      description: 'Aceway 2024 truck stencil package.',
      numbers: {
        usDot: 'USDOT 1988341',
        svor: 'SVOR 2201-ON',
        mcdot: 'MC 771203',
      },
      files: [
        {
          id: 'aceway-2024',
          label: 'Aceway 2024',
          type: 'pdf',
          file: '/style-guides/trucks/aceway-2024.pdf',
          available: true,
        },
        {
          id: 'aceway-preview',
          label: 'Aceway Peterbilt preview',
          type: 'image',
          file: '/style-guides/trucks/aceway-preview.jpg',
          available: true,
        },
      ],
    },
    {
      id: 'ca',
      name: 'CA Dedicated',
      company: 'CA Dedicated',
      equipment: ['highway', 'day-cab'],
      region: 'USA',
      description: 'CA 2024 dedicated truck stencil package.',
      numbers: {
        usDot: 'USDOT 4012290',
        svor: '—',
        mcdot: 'MC 512880',
      },
      files: [
        {
          id: 'ca-2024',
          label: 'CA 2024',
          type: 'pdf',
          file: '/style-guides/trucks/ca-2024.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/CA 2024.pdf',
        },
        {
          id: 'ca-preview',
          label: 'CA dedicated preview',
          type: 'image',
          file: '/style-guides/trucks/ca-preview.jpg',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/ca dedicated.jpg',
        },
      ],
    },
    {
      id: 'rav',
      name: 'RAV',
      company: 'RAV',
      equipment: ['highway'],
      region: 'Canada',
      description: 'RAV 2024 truck stencil package.',
      numbers: {
        usDot: 'USDOT 2677110',
        svor: 'SVOR 1188-AB',
        mcdot: 'MC 334901',
      },
      files: [
        {
          id: 'rav-2024',
          label: 'RAV 2024',
          type: 'pdf',
          file: '/style-guides/trucks/rav-2024.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/RAV 2024.pdf',
        },
      ],
    },
    {
      id: 'zip',
      name: 'Zip Express',
      company: 'Zip Express',
      equipment: ['highway', 'day-cab'],
      region: 'Canada',
      description: 'Zip 2024 truck stencil package.',
      numbers: {
        usDot: 'USDOT 1556022',
        svor: 'SVOR 9044-ON',
        mcdot: 'MC 228440',
      },
      files: [
        {
          id: 'zip-2024',
          label: 'Zip 2024',
          type: 'pdf',
          file: '/style-guides/trucks/zip-2024.pdf',
          available: true,
        },
        {
          id: 'zip-preview',
          label: 'Zip Peterbilt preview',
          type: 'image',
          file: '/style-guides/trucks/zip-preview.jpg',
          available: true,
        },
      ],
    },
    {
      id: 'blueway',
      name: 'Blueway',
      company: 'Blueway',
      equipment: ['highway'],
      region: 'Canada',
      description: 'Blueway truck size guide.',
      numbers: {
        usDot: 'USDOT 2881004',
        svor: 'SVOR 3310-QC',
        mcdot: 'MC 610228',
      },
      files: [
        {
          id: 'blueway',
          label: 'Blueway truck size',
          type: 'pdf',
          file: '/style-guides/trucks/blueway.pdf',
          available: false,
          source: 'ALL COMPAINES TRUCK STENSILS/BLUEWAY TRUCK SIZE.pdf',
        },
      ],
    },
    {
      id: 'ts-intl',
      name: 'TS Trucking',
      company: 'TS Trucking',
      equipment: ['day-cab', 'highway'],
      region: 'Canada',
      description: 'TS Trucking International truck stencil package.',
      numbers: {
        usDot: 'USDOT 1099332',
        svor: 'SVOR 7721-ON',
        mcdot: 'MC 119003',
      },
      files: [
        {
          id: 'international-ts',
          label: 'International TS',
          type: 'pdf',
          file: '/style-guides/trucks/international-ts.pdf',
          available: true,
        },
      ],
    },
  ],
  trailers: [
    {
      id: 'charger-trl',
      name: 'Charger Logistics',
      company: 'Charger Logistics',
      equipment: ['dry-van', 'reefer', 'heater'],
      region: 'Canada / USA',
      description: 'Charger Logistics trailer marking reference for dry van, reefer, and heater units.',
      numbers: {
        usDot: '—',
        svor: 'SVOR 4521-CA',
        mcdot: '—',
      },
      files: [
        {
          id: 'charger-trailer',
          label: 'Charger logistics trailer',
          type: 'pdf',
          file: '/style-guides/trailers/charger-trailer.pdf',
          available: true,
        },
      ],
    },
    {
      id: 'drive-trl',
      name: 'Drive',
      company: 'Drive',
      equipment: ['dry-van', 'reefer'],
      region: 'Canada / USA',
      description: 'Drive trailer stencil package for dry van and reefer fleets.',
      numbers: {
        usDot: 'USDOT 2789012',
        svor: 'SVOR 6104-ON',
        mcdot: 'MC 552118',
      },
      files: [
        {
          id: 'drive-trailer',
          label: 'Drive trailer guide',
          type: 'pdf',
          file: '/style-guides/trailers/dry-van.pdf',
          available: true,
        },
      ],
    },
    {
      id: 'reefer-trl',
      name: 'Reefer',
      company: 'Reefer',
      equipment: ['reefer'],
      region: 'Canada / USA',
      description: 'Reefer trailer marking and install reference.',
      numbers: {
        usDot: '—',
        svor: '—',
        mcdot: '—',
      },
      files: [
        {
          id: 'reefer-guide',
          label: 'Reefer trailer guide',
          type: 'pdf',
          file: '/style-guides/trailers/utility-dry-van.pdf',
          available: true,
        },
      ],
    },
    {
      id: 'ts-trl',
      name: 'TS Trucking',
      company: 'TS Trucking',
      equipment: ['dry-van', 'heater'],
      region: 'Canada',
      description: 'TS Trucking trailer stencil package.',
      numbers: {
        usDot: 'USDOT 1099332',
        svor: 'SVOR 7721-ON',
        mcdot: 'MC 119003',
      },
      files: [
        {
          id: 'ts-trailer',
          label: 'TS Trucking trailer',
          type: 'pdf',
          file: '/style-guides/trailers/wabash-dry-van.pdf',
          available: true,
        },
      ],
    },
    {
      id: 'utility',
      name: 'Utility',
      company: 'Utility',
      equipment: ['dry-van', 'reefer'],
      region: 'Trailer OEM',
      description: 'Utility dry van & reefer installation dimensions.',
      numbers: {
        usDot: '—',
        svor: '—',
        mcdot: '—',
      },
      files: [
        {
          id: 'utility-dry-van',
          label: 'Utility Dry Van',
          type: 'pdf',
          file: '/style-guides/trailers/utility-dry-van.pdf',
          available: true,
        },
        {
          id: 'utility-reefer',
          label: 'Utility Reefer',
          type: 'pdf',
          file: '/style-guides/trailers/utility-reefer.pdf',
          available: false,
          source: 'CHARGER TRAILERS/UTILITY/REEFER.pdf',
        },
      ],
    },
    {
      id: 'wabash',
      name: 'Wabash',
      company: 'Wabash',
      equipment: ['dry-van'],
      region: 'Trailer OEM',
      description: 'Wabash dry van marking guide.',
      numbers: {
        usDot: '—',
        svor: '—',
        mcdot: '—',
      },
      files: [
        {
          id: 'wabash-dry-van',
          label: 'Wabash Dry Van',
          type: 'pdf',
          file: '/style-guides/trailers/wabash-dry-van.pdf',
          available: true,
        },
      ],
    },
    {
      id: 'dye-cast',
      name: 'Dye cast',
      company: 'Specialty',
      equipment: ['heater'],
      region: 'Trailer',
      description: 'Dye cast trailer stencil reference.',
      numbers: {
        usDot: '—',
        svor: '—',
        mcdot: '—',
      },
      files: [
        {
          id: 'dye-cast',
          label: 'Dye cast trailer',
          type: 'pdf',
          file: '/style-guides/trailers/dye-cast.pdf',
          available: true,
        },
      ],
    },
  ],
}

export function firstAvailableFile(division) {
  return division?.files?.find((f) => f.available) || division?.files?.[0] || null
}

export function equipmentLabel(kind, id) {
  return SG_EQUIPMENT[kind]?.find((e) => e.id === id)?.label || id
}
