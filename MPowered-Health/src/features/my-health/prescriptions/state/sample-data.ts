import type { Medication } from './model';
export const demoMedications: Medication[] = [
  ['Perindopril arginine', '5', 'mg'],
  ['Candesartan', '16', 'mg'],
  ['Amlodipine', '5', 'mg'],
  ['Vitamin D3', '1000', 'IU'],
  ['Raloxifene', '60', 'mg'],
].map(([name, strength, unit], index) => ({
  id: `demo-${index}`,
  name,
  strength,
  unit,
  form: 'Tablet',
  repeat: 'day',
  scheduleLabel: 'Once daily',
}));
