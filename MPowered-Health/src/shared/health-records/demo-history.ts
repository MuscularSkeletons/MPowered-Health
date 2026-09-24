import type { PainAssessmentRecord } from './pain-history';

/** Presentation fixtures only: never save these as a patient's assessments. */
export function getDemoPainHistory(): PainAssessmentRecord[] {
  return [
    { day: '01', areas: ['Back', 'Knee'], average: 5, worst: 8, mildest: 2 },
    { day: '08', areas: ['Back'], average: 4, worst: 7, mildest: 1 },
    { day: '15', areas: ['Back', 'Knee'], average: 7, worst: 9, mildest: 3 },
    { day: '22', areas: ['Back'], average: 3, worst: 6, mildest: 1 },
    { day: '29', areas: ['Back', 'Knee'], average: 4, worst: 7, mildest: 2 },
  ].map(({ day, areas, average, worst, mildest }) => ({
    id: `demo-pain-${day}`,
    completedAt: `2026-06-${day}T02:00:00.000Z`,
    areas, current: average, average, worst, mildest,
    answers: { 0: [...areas], 1: ['Aching'], 2: [String(average)],
      3: [String(mildest)], 4: [String(worst)], 5: [String(average)] },
  }));
}

export const isDemoPainRecord = (record: PainAssessmentRecord) => record.id.startsWith('demo-pain-');
