export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
  trend: number[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  healthScore: number;
  riskLevel: 'stable' | 'monitor' | 'high-risk';
  lastChecked: string;
  vitals: VitalSign[];
  adherence: number;
  avatar: string;
}

export const currentVitals: VitalSign[] = [
  {
    label: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    icon: 'Heart',
    status: 'normal',
    trend: [68, 71, 73, 70, 72, 74, 72],
  },
  {
    label: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    icon: 'Activity',
    status: 'normal',
    trend: [118, 122, 119, 125, 120, 121, 120],
  },
  {
    label: 'Glucose',
    value: '142',
    unit: 'mg/dL',
    icon: 'Droplets',
    status: 'warning',
    trend: [130, 135, 140, 138, 145, 142, 142],
  },
  {
    label: 'SpO₂',
    value: '98',
    unit: '%',
    icon: 'Wind',
    status: 'normal',
    trend: [97, 98, 98, 97, 99, 98, 98],
  },
];

export const medications = [
  { name: 'Metformin', dose: '500mg', time: '08:00 AM', taken: true },
  { name: 'Lisinopril', dose: '10mg', time: '08:00 AM', taken: true },
  { name: 'Atorvastatin', dose: '20mg', time: '09:00 PM', taken: false },
  { name: 'Metformin', dose: '500mg', time: '08:00 PM', taken: false },
];

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Karthik Subramanian',
    age: 62,
    condition: 'Type 2 Diabetes, Hypertension',
    healthScore: 45,
    riskLevel: 'high-risk',
    lastChecked: '2 min ago',
    adherence: 62,
    avatar: 'KS',
    vitals: [
      { label: 'Heart Rate', value: '98', unit: 'bpm', icon: 'Heart', status: 'warning', trend: [88, 92, 95, 98, 96, 98, 98] },
      { label: 'Blood Pressure', value: '158/95', unit: 'mmHg', icon: 'Activity', status: 'critical', trend: [145, 150, 155, 158, 160, 158, 158] },
      { label: 'Glucose', value: '210', unit: 'mg/dL', icon: 'Droplets', status: 'critical', trend: [180, 190, 200, 205, 210, 208, 210] },
      { label: 'SpO₂', value: '94', unit: '%', icon: 'Wind', status: 'warning', trend: [96, 95, 95, 94, 94, 95, 94] },
    ],
  },
  {
    id: '2',
    name: 'Priya Rajan',
    age: 55,
    condition: 'COPD, Heart Failure',
    healthScore: 68,
    riskLevel: 'monitor',
    lastChecked: '15 min ago',
    adherence: 78,
    avatar: 'PR',
    vitals: [
      { label: 'Heart Rate', value: '82', unit: 'bpm', icon: 'Heart', status: 'normal', trend: [78, 80, 82, 81, 83, 82, 82] },
      { label: 'Blood Pressure', value: '138/88', unit: 'mmHg', icon: 'Activity', status: 'warning', trend: [130, 132, 135, 136, 138, 137, 138] },
      { label: 'Glucose', value: '125', unit: 'mg/dL', icon: 'Droplets', status: 'normal', trend: [120, 122, 124, 125, 123, 125, 125] },
      { label: 'SpO₂', value: '96', unit: '%', icon: 'Wind', status: 'normal', trend: [97, 96, 97, 96, 96, 97, 96] },
    ],
  },
  {
    id: '3',
    name: 'Srinivasan Iyer',
    age: 48,
    condition: 'Chronic Kidney Disease',
    healthScore: 88,
    riskLevel: 'stable',
    lastChecked: '1 hr ago',
    adherence: 95,
    avatar: 'SI',
    vitals: [
      { label: 'Heart Rate', value: '70', unit: 'bpm', icon: 'Heart', status: 'normal', trend: [68, 70, 69, 71, 70, 70, 70] },
      { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', icon: 'Activity', status: 'normal', trend: [115, 118, 116, 119, 118, 117, 118] },
      { label: 'Glucose', value: '105', unit: 'mg/dL', icon: 'Droplets', status: 'normal', trend: [100, 102, 104, 105, 103, 105, 105] },
      { label: 'SpO₂', value: '99', unit: '%', icon: 'Wind', status: 'normal', trend: [98, 99, 99, 98, 99, 99, 99] },
    ],
  },
  {
    id: '4',
    name: 'Muthusamy Gounder',
    age: 71,
    condition: 'Atrial Fibrillation',
    healthScore: 52,
    riskLevel: 'high-risk',
    lastChecked: '5 min ago',
    adherence: 55,
    avatar: 'MG',
    vitals: [
      { label: 'Heart Rate', value: '112', unit: 'bpm', icon: 'Heart', status: 'critical', trend: [100, 105, 108, 110, 115, 112, 112] },
      { label: 'Blood Pressure', value: '145/92', unit: 'mmHg', icon: 'Activity', status: 'warning', trend: [138, 140, 142, 145, 143, 145, 145] },
      { label: 'Glucose', value: '118', unit: 'mg/dL', icon: 'Droplets', status: 'normal', trend: [115, 116, 118, 117, 118, 118, 118] },
      { label: 'SpO₂', value: '95', unit: '%', icon: 'Wind', status: 'normal', trend: [96, 95, 96, 95, 95, 96, 95] },
    ],
  },
  {
    id: '5',
    name: 'Anitha Krishnan',
    age: 59,
    condition: 'Asthma, Obesity',
    healthScore: 74,
    riskLevel: 'monitor',
    lastChecked: '30 min ago',
    adherence: 82,
    avatar: 'AK',
    vitals: [
      { label: 'Heart Rate', value: '76', unit: 'bpm', icon: 'Heart', status: 'normal', trend: [74, 75, 76, 75, 77, 76, 76] },
      { label: 'Blood Pressure', value: '130/84', unit: 'mmHg', icon: 'Activity', status: 'normal', trend: [128, 130, 129, 131, 130, 130, 130] },
      { label: 'Glucose', value: '155', unit: 'mg/dL', icon: 'Droplets', status: 'warning', trend: [148, 150, 152, 155, 153, 155, 155] },
      { label: 'SpO₂', value: '97', unit: '%', icon: 'Wind', status: 'normal', trend: [97, 97, 98, 97, 97, 97, 97] },
    ],
  },
];

export const weeklyAdherenceData = [
  { day: 'Mon', adherence: 100 },
  { day: 'Tue', adherence: 85 },
  { day: 'Wed', adherence: 100 },
  { day: 'Thu', adherence: 70 },
  { day: 'Fri', adherence: 100 },
  { day: 'Sat', adherence: 85 },
  { day: 'Sun', adherence: 100 },
];

export const vitalsTrendData = [
  { time: '6AM', hr: 68, bp: 118, glucose: 130, spo2: 97 },
  { time: '8AM', hr: 71, bp: 122, glucose: 135, spo2: 98 },
  { time: '10AM', hr: 73, bp: 119, glucose: 140, spo2: 98 },
  { time: '12PM', hr: 70, bp: 125, glucose: 138, spo2: 97 },
  { time: '2PM', hr: 72, bp: 120, glucose: 145, spo2: 99 },
  { time: '4PM', hr: 74, bp: 121, glucose: 142, spo2: 98 },
  { time: '6PM', hr: 72, bp: 120, glucose: 142, spo2: 98 },
];
