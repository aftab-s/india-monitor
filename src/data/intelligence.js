// ✅ Fully updated — May 2026
// Sources: CWC Bulletin Apr 30 2026 | CERT-In Annual Report 2025 | PIB | Official MSP 2025-26

export const STATE_ECONOMY = {
  MH: { gsdp: '₹35.6L Cr', growth: 7.2, perCapita: '₹2.7L', industries: ['Finance', 'IT', 'Auto'] },
  KA: { gsdp: '₹22.4L Cr', growth: 8.1, perCapita: '₹3.1L', industries: ['IT', 'Biotech', 'Aerospace'] },
  TN: { gsdp: '₹22.1L Cr', growth: 6.8, perCapita: '₹2.8L', industries: ['Auto', 'Textiles', 'Manufacturing'] },
  UP: { gsdp: '₹21.7L Cr', growth: 6.5, perCapita: '₹0.8L', industries: ['Agriculture', 'MSME', 'Tourism'] },
  GJ: { gsdp: '₹20.2L Cr', growth: 7.8, perCapita: '₹2.8L', industries: ['Petrochemicals', 'Textiles', 'Pharma'] },
  DL: { gsdp: '₹10.5L Cr', growth: 6.2, perCapita: '₹4.3L', industries: ['Services', 'IT', 'Trade'] },
  WB: { gsdp: '₹15.1L Cr', growth: 5.9, perCapita: '₹1.3L', industries: ['Agriculture', 'Steel', 'IT'] },
  TS: { gsdp: '₹13.7L Cr', growth: 7.5, perCapita: '₹3.2L', industries: ['IT', 'Pharma', 'Defence'] },
  AP: { gsdp: '₹12.8L Cr', growth: 7.0, perCapita: '₹2.1L', industries: ['Agriculture', 'Aquaculture', 'Pharma'] },
  RJ: { gsdp: '₹12.6L Cr', growth: 6.4, perCapita: '₹1.4L', industries: ['Mining', 'Tourism', 'Renewables'] },
  PB: { gsdp: '₹6.8L Cr', growth: 5.5, perCapita: '₹1.8L', industries: ['Agriculture', 'Textiles', 'Sports Goods'] },
  HR: { gsdp: '₹9.9L Cr', growth: 6.8, perCapita: '₹3.0L', industries: ['Auto', 'IT', 'Agriculture'] },
  KL: { gsdp: '₹10.0L Cr', growth: 5.7, perCapita: '₹2.4L', industries: ['Tourism', 'IT', 'Remittances'] },
};

export const CROP_PRICES = {
  // Official Government of India MSP 2025-26
  Wheat:     { price: 2425, change: 6.6 },   // Rabi 2025-26
  Rice:      { price: 2369, change: 3.0 },   // Kharif 2025-26 (common paddy)
  Mustard:   { price: 5950, change: 5.3 },   // Rabi 2025-26
  Cotton:    { price: 7710, change: 8.3 },   // Kharif 2025-26 (medium staple)
  Soybean:   { price: 5328, change: 8.9 },   // Kharif 2025-26
  Sugarcane: { price: 355,  change: 4.4 },   // FRP 2025-26 season
};

export const WATER_RESERVOIRS = [
  // Source: CWC Weekly Bulletin Apr 30, 2026 — Top 5 by live storage capacity
  // National: 166 reservoirs at ~37% (below 40% threshold); Krishna basin critical at ~22.55%
  // #1 Indira Sagar — 12.22 BCM — Narmada, MP
  { name: 'Indira Sagar',    state: 'MP',    capacity: '39%', trend: 'down',   alert: true  }, // Narmada basin ~38.82%
  // #2 Nagarjuna Sagar — 9.75 BCM — Krishna, TS/AP
  { name: 'Nagarjuna Sagar', state: 'TS/AP', capacity: '22%', trend: 'down',   alert: true  }, // Krishna basin ~22.55% — critical
  // #3 Bhakra / Gobind Sagar — 9.34 BCM — Sutlej, HP/PB
  { name: 'Bhakra Nangal',   state: 'HP/PB', capacity: '42%', trend: 'down',   alert: true  }, // Northern region declining
  // #4 Srisailam — 6.01 BCM — Krishna, TS/AP
  { name: 'Srisailam',       state: 'TS/AP', capacity: '20%', trend: 'down',   alert: true  }, // Krishna basin — critical
  // #5 Sardar Sarovar — 5.8 BCM — Narmada, GJ
  { name: 'Sardar Sarovar',  state: 'GJ',    capacity: '39%', trend: 'down',   alert: true  }, // Narmada basin ~38.82%
];

export const CYBER_THREATS = [
  // Source: CERT-In Annual Report 2025 (Jan 2026) | DSCI India Cyber Threat Report 2025
  // Total 2025: 29.44 lakh incidents | 1,530 alerts | 390 vulnerability notes
  // Jan–Jun 2025: avg 4.1M attacks/month on critical sectors | 4.26B attacks blocked
  { sector: 'Banking & Fin', level: 'CRITICAL', incidents: 520, trend: '+30%'  }, // BFSI top audit focus; DDoS +350%
  { sector: 'Energy Grid',   level: 'HIGH',     incidents: 94,  trend: '+18%'  }, // CSIRT-Power active; OT/SCADA targeting rising
  { sector: 'Gov Portals',   level: 'CRITICAL', incidents: 680, trend: '+25%'  }, // Largest category per CERT-In
  { sector: 'Healthcare',    level: 'HIGH',     incidents: 315, trend: '+247%' }, // Ransomware surge; hospital attacks
];

export const BORDER_STATUS = [
  { region: 'LoC (West)', status: 'ACTIVE PATROL', alert: 'YELLOW', lastIncident: '12h ago' },
  { region: 'LAC (North)', status: 'HIGH ALERT',   alert: 'ORANGE', lastIncident: '72h ago' },
  { region: 'LAC (East)',  status: 'MONITORED',    alert: 'YELLOW', lastIncident: '5d ago'  },
  { region: 'IB (West)',   status: 'STABLE',       alert: 'GREEN',  lastIncident: '14d ago' },
  { region: 'IB (East)',   status: 'STABLE',       alert: 'GREEN',  lastIncident: '21d ago' },
];

export const INFRA_TARGETS = {
  // Source: PIB / NHAI FY25 report | Indian Railways Apr 2026 | AAI 2025
  highways: { built: 146195, target: 200000, fy: 'FY25-26', unit: 'total NH network km' },
  railways:  { electrified: 69873, total: 70117, fy: 'Mar 2026' }, // 99.6% electrified
  airports:  { operational: 160, target: 220 },
};

export const ELECTION_DATA = {
  upcoming: [
    { state: 'Goa',           type: 'Assembly', expected: 'Feb-Mar 2027', seats: 40,  termEnd: 'Mar 2027' },
    { state: 'Manipur',       type: 'Assembly', expected: 'Feb-Mar 2027', seats: 60,  termEnd: 'Mar 2027' },
    { state: 'Punjab',        type: 'Assembly', expected: 'Feb-Mar 2027', seats: 117, termEnd: 'Mar 2027' },
    { state: 'Uttarakhand',   type: 'Assembly', expected: 'Feb-Mar 2027', seats: 70,  termEnd: 'Mar 2027' },
    { state: 'Uttar Pradesh', type: 'Assembly', expected: 'Apr-May 2027', seats: 403, termEnd: 'May 2027' },
  ],
  recent: [
    { state: 'Kerala',       type: 'Assembly', date: 'May 2026', winner: 'UDF (INC)'  },
    { state: 'West Bengal',  type: 'Assembly', date: 'May 2026', winner: 'NDA (BJP)'  },
    { state: 'Tamil Nadu',   type: 'Assembly', date: 'May 2026', winner: 'TVK'        },
    { state: 'Assam',        type: 'Assembly', date: 'May 2026', winner: 'NDA'        },
    { state: 'Puducherry',   type: 'Assembly', date: 'May 2026', winner: 'NDA (AINRC)'},
  ],
};

export const UNICORN_DATA = [
  { name: 'Flipkart',  sector: 'E-commerce', valuation: 38.0, year: 2012, note: '~$38-40B estimate 2025' },
  // { name: 'BYJU\'S',  sector: 'Edtech',      valuation: 0.5,  year: 2018, note: 'Collapsed — near-zero value' },
  { name: 'Swiggy',   sector: 'Food delivery', valuation: 10.7, year: 2018, note: 'Publicly listed IPO Nov 2024' },
  { name: 'OYO',      sector: 'Hospitality', valuation: 6.5,  year: 2018, note: 'Down-round from $9B' },
  { name: 'Ola',      sector: 'Ride-hailing', valuation: 4.8, year: 2018, note: 'Markdown by Vanguard from $7.3B' },
  { name: 'PhonePe',  sector: 'Fintech',     valuation: 14.5, year: 2020, note: 'Last known valuation Oct 2025' },
  { name: 'Zerodha',  sector: 'Fintech',     valuation: 3.6,  year: 2020 },
  { name: 'Razorpay', sector: 'Fintech',     valuation: 5.5,  year: 2021, note: 'IPO-bound; reset from $7.5B peak' },
];

export const STATE_DEMOGRAPHICS = {
  MH: { population: '12.5 Cr', literacy: '82.3%' },
  UP: { population: '24.1 Cr', literacy: '67.7%' },
  BR: { population: '12.4 Cr', literacy: '61.8%' },
  WB: { population: '10.1 Cr', literacy: '76.3%' },
  MP: { population: '8.5 Cr',  literacy: '69.3%' },
  TN: { population: '7.7 Cr',  literacy: '80.3%' },
  RJ: { population: '8.1 Cr',  literacy: '66.1%' },
  KA: { population: '6.7 Cr',  literacy: '75.4%' },
  GJ: { population: '7.0 Cr',  literacy: '78.0%' },
  AP: { population: '5.3 Cr',  literacy: '67.0%' },
  TS: { population: '3.9 Cr',  literacy: '72.8%' },
  KL: { population: '3.5 Cr',  literacy: '96.2%' },
  DL: { population: '2.0 Cr',  literacy: '86.2%' },
  PB: { population: '3.0 Cr',  literacy: '75.8%' },
  HR: { population: '2.8 Cr',  literacy: '75.5%' },
  SK: { population: '6.9 L',   literacy: '81.4%' },
  MZ: { population: '12.4 L',  literacy: '91.6%' },
  GA: { population: '15.8 L',  literacy: '88.7%' },
  HP: { population: '75.0 L',  literacy: '83.8%' },
};

export const STATE_AGRICULTURE = {
  PB: ['Wheat', 'Rice', 'Cotton'],
  HR: ['Wheat', 'Mustard', 'Bajra'],
  UP: ['Sugarcane', 'Wheat', 'Rice'],
  MP: ['Soybean', 'Wheat', 'Pulses'],
  MH: ['Sugarcane', 'Cotton', 'Onion'],
  KA: ['Coffee', 'Rice', 'Ragi'],
  AP: ['Rice', 'Chilli', 'Cotton'],
  WB: ['Rice', 'Jute', 'Tea'],
  RJ: ['Mustard', 'Bajra', 'Wheat'],
  GJ: ['Cotton', 'Groundnut', 'Castor'],
  KL: ['Rubber', 'Spices', 'Coconut'],
  TN: ['Rice', 'Cotton', 'Sugarcane'],
};

export const SAFE_REGIONS = ['KL', 'SK', 'MZ', 'GA', 'HP', 'PY', 'LD', 'AN', 'CH', 'DD'];

export const SECTOR_HEATMAP = [
  { name: 'IT',      change: -1.24, color: '#3b82f6' }, // Nifty IT underperforming YTD -12%; down today
  { name: 'Banking', change:  0.43, color: '#10b981' }, // PSU Banks +29% YTD; resilient despite LoC tension
  { name: 'Pharma',  change: -0.65, color: '#8b5cf6' }, // Muted; freight cost pressure, geopolitical headwinds
  { name: 'Auto',    change:  0.91, color: '#f59e0b' }, // Strong YTD +22%; GST cuts boosting demand
  { name: 'FMCG',   change: -0.32, color: '#ec4899' }, // Cautious; edible oil prices up; crude above $100
  { name: 'Energy',  change:  1.18, color: '#ef4444' }, // Resilient; crude >$100 benefits upstream; Oil & Gas advancing
  { name: 'Metal',   change:  1.54, color: '#6b7280' }, // Strong YTD +27%; China steel output down, EV demand up
];

export const SECURITY_EVENTS = {
  lwe: [
    { location: 'Bijapur, CG',       type: 'Combing Op',   date: '6h ago',  severity: 'high'   },
    { location: 'Sukma, CG',         type: 'IED Detection', date: '1d ago', severity: 'medium' },
    { location: 'W. Singhbhum, JH',  type: 'Patrol',       date: '3d ago',  severity: 'low'    },
  ],
  jk: [
    { location: 'Poonch (Krishna Ghati), JK', type: 'Infiltration Foiled', date: 'Yesterday', severity: 'high'   }, // LeT terrorist neutralised
    { location: 'Poonch, JK',                 type: 'Search Op ongoing',   date: 'Live',      severity: 'medium' }, // Sanitisation op still active
  ],
};

export const SYSTEM_INFO = {
  badge: 'LIVE SURFACE',
  index: '01',
  brand: 'Observe India',
  tagline: 'Live civic signal layer',
  description: 'A compact editorial surface for markets, weather, alerts, and live coverage. Built to stay readable, fast, and low-noise.',
  sources: [
    { label: 'Live Feeds',   value: '12'        },
    { label: 'Coverage',     value: '36 States' },
    { label: 'Update Pace',  value: 'Realtime'  },
    { label: 'Layout',       value: 'Modular'   },
  ],
  build: 'BUILD_2026.05.04_REL_A',
  collaboration: {
    label: 'Kerala Monitor',
    href: 'https://what-s-happening-in-kerala.vercel.app/',
  },
  githubUrl: 'https://github.com/Aftab-S/India-Monitor',
  copyright: '© 2026 Observe India',
};