import {
  buildSnapshot,
  type AssessmentRow,
} from '@/services/health-records.mapper';
import { groupPainHistory } from '@/services/health-records.store';
import { buildHealthRecordsHtml } from '@/lib/health-records-report';

jest.mock('@/services/health-records.services', () => ({ fetchHealthSnapshot: jest.fn() }));

const assessment = (
  id: string,
  date: string,
  average: number,
  areas: string[],
): AssessmentRow => ({
  assessment_id: id,
  date,
  pain_assessment: {
    current_pain: average,
    mildest_pain: Math.max(0, average - 2),
    worst_pain: Math.min(10, average + 2),
    average_pain: average,
    pain_location: areas,
    pain_characteristics: ['Aching'],
  },
  movement_assessment: null,
  personal_care_assessment: null,
  social_health_assessment: null,
  management_assessment: null,
});

it('maps Supabase assessments into ordered, grouped pain records', () => {
  const snapshot = buildSnapshot([
    assessment('newer', '2026-06-08T10:00:00.000Z', 7, ['Knee', 'Back']),
    assessment('older', '2026-06-01T10:00:00.000Z', 5, ['Back', 'Knee']),
  ]);

  expect(snapshot.painRecords.map((record) => record.id)).toEqual(['older', 'newer']);
  expect(groupPainHistory(snapshot.painRecords)).toHaveLength(1);
  expect(groupPainHistory(snapshot.painRecords)[0].label).toBe('Back, Knee');
});

it('escapes user-provided labels in the printable report', () => {
  const records = buildSnapshot([
    assessment('record', '2026-06-08T10:00:00.000Z', 7, ['Back']),
  ]).painRecords;

  const report = buildHealthRecordsHtml(records, '<Back & Knee>', 'Average');

  expect(report).toContain('&lt;Back &amp; Knee&gt;');
  expect(report).not.toContain('<Back & Knee>');
});
