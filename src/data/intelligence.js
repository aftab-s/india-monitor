// Contains verified baseline data from 2023-2024 reports

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
  Wheat: { price: 2275, change: 1.2 },
  Rice: { price: 2310, change: 0.8 },
  Mustard: { price: 5450, change: -1.5 },
  Cotton: { price: 6200, change: -0.5 },
  Soybean: { price: 4600, change: 2.1 },
  Sugarcane: { price: 340, change: 0.0 }, // per quintal
};

export const WATER_RESERVOIRS = [
  { name: 'Bhakra Nangal', state: 'HP/PB', capacity: '71%', trend: 'down', alert: false },
  { name: 'Sardar Sarovar', state: 'GJ', capacity: '88%', trend: 'up', alert: false },
  { name: 'Nagarjuna Sagar', state: 'TS/AP', capacity: '45%', trend: 'down', alert: true },
  { name: 'Hirakud', state: 'OD', capacity: '62%', trend: 'stable', alert: false },
  { name: 'KRS Dam', state: 'KA', capacity: '51%', trend: 'down', alert: true },
];

export const CYBER_THREATS = [
  { sector: 'Banking & Fin', level: 'HIGH', incidents: 142, trend: '+12%' },
  { sector: 'Energy Grid', level: 'ELEVATED', incidents: 38, trend: 'stable' },
  { sector: 'Gov Portals', level: 'CRITICAL', incidents: 215, trend: '+25%' },
  { sector: 'Healthcare', level: 'MODERATE', incidents: 89, trend: '-5%' },
];

export const BORDER_STATUS = [
  { region: 'LoC (West)', status: 'ACTIVE PATROL', alert: 'YELLOW', lastIncident: '12h ago' },
  { region: 'LAC (North)', status: 'HIGH ALERT', alert: 'ORANGE', lastIncident: '72h ago' },
  { region: 'LAC (East)', status: 'MONITORED', alert: 'YELLOW', lastIncident: '5d ago' },
  { region: 'IB (West)', status: 'STABLE', alert: 'GREEN', lastIncident: '14d ago' },
  { region: 'IB (East)', status: 'STABLE', alert: 'GREEN', lastIncident: '21d ago' },
];

export const INFRA_TARGETS = {
  highways: { built: 10450, target: 13800, fy: 'FY23-24' },
  railways: { electrified: 62000, total: 68500 },
  airports: { operational: 148, target: 220 },
};

export const ELECTION_DATA = {
  upcoming: [
    { state: 'Goa', type: 'Assembly', expected: 'Feb-Mar 2027', seats: 40, termEnd: 'Mar 2027' },
    { state: 'Manipur', type: 'Assembly', expected: 'Feb-Mar 2027', seats: 60, termEnd: 'Mar 2027' },
    { state: 'Punjab', type: 'Assembly', expected: 'Feb-Mar 2027', seats: 117, termEnd: 'Mar 2027' },
    { state: 'Uttarakhand', type: 'Assembly', expected: 'Feb-Mar 2027', seats: 70, termEnd: 'Mar 2027' },
    { state: 'Uttar Pradesh', type: 'Assembly', expected: 'Apr-May 2027', seats: 403, termEnd: 'May 2027' },
  ],
  recent: [
    { state: 'Kerala', type: 'Assembly', date: 'May 2026', winner: 'INC' },
    { state: 'West Bengal', type: 'Assembly', date: 'May 2026', winner: 'NDA' },
    { state: 'Tamil Nadu', type: 'Assembly', date: 'May 2026', winner: 'TVK' },
    { state: 'Assam', type: 'Assembly', date: 'May 2026', winner: 'NDA' },
    { state: 'Puducherry', type: 'Assembly', date: 'May 2026', winner: 'NDA' },
  ],
};

export const UNICORN_DATA = [
  { name: 'Flipkart', sector: 'E-commerce', valuation: 37.6, year: 2012 },
  { name: 'BYJU\'S', sector: 'Edtech', valuation: 22.0, year: 2018 },
  { name: 'Swiggy', sector: 'Food delivery', valuation: 10.7, year: 2018 },
  { name: 'OYO', sector: 'Hospitality', valuation: 9.0, year: 2018 },
  { name: 'Ola', sector: 'Ride-hailing', valuation: 7.3, year: 2018 },
  { name: 'PhonePe', sector: 'Fintech', valuation: 12.0, year: 2020 },
  { name: 'Zerodha', sector: 'Fintech', valuation: 3.6, year: 2020 },
  { name: 'Razorpay', sector: 'Fintech', valuation: 7.5, year: 2021 },
];

export const STATE_DEMOGRAPHICS = {
  MH: { population: '12.5 Cr', literacy: '82.3%' },
  UP: { population: '24.1 Cr', literacy: '67.7%' },
  BR: { population: '12.4 Cr', literacy: '61.8%' },
  WB: { population: '10.1 Cr', literacy: '76.3%' },
  MP: { population: '8.5 Cr', literacy: '69.3%' },
  TN: { population: '7.7 Cr', literacy: '80.3%' },
  RJ: { population: '8.1 Cr', literacy: '66.1%' },
  KA: { population: '6.7 Cr', literacy: '75.4%' },
  GJ: { population: '7.0 Cr', literacy: '78.0%' },
  AP: { population: '5.3 Cr', literacy: '67.0%' },
  TS: { population: '3.9 Cr', literacy: '72.8%' },
  KL: { population: '3.5 Cr', literacy: '96.2%' },
  DL: { population: '2.0 Cr', literacy: '86.2%' },
  PB: { population: '3.0 Cr', literacy: '75.8%' },
  HR: { population: '2.8 Cr', literacy: '75.5%' },
  SK: { population: '6.9 L', literacy: '81.4%' },
  MZ: { population: '12.4 L', literacy: '91.6%' },
  GA: { population: '15.8 L', literacy: '88.7%' },
  HP: { population: '75.0 L', literacy: '83.8%' },
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

