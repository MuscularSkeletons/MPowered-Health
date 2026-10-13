/**
 * Groups dated pain assessments for screens and reports.
 *
 * History lives in supabase. This module keeps only an in-memory copy for the current session, so
 * the screens can keep reading it, with nothing written to device.
 */
import type { AssessmentAnswers } from '@/shared/health-records/assessment-types';
import { fetchHealthSnapshot } from '@/services/health-records.services';
import type { HealthSnapshot } from '@/services/health-records.mapper';
 
export type PainAssessmentRecord = {
  id: string;
  completedAt: string;
  areas: string[];
  current: number;
  mildest: number;
  worst: number;
  average: number;
  answers: AssessmentAnswers;
};
export type PainMetric = 'Average' | 'Worst' | 'Mildest';
export type PainAreaGroup = { key: string; label: string; records: PainAssessmentRecord[] };

/** The id the session boundary passes when nobody is signed in. */
const SIGNED_OUT = 'signed-out';
 
let accountId: string | null = null;
let generation = 0;
let records: PainAssessmentRecord[] = [];
let latest: HealthSnapshot['latest'] = {};
 
/** Select an account without exposing another account's saved assessments. */
export function setPainHistoryAccount(userId: string) {
  generation += 1;
  accountId = userId === SIGNED_OUT ? null : userId;
  records = [];
  latest = {};
}
 
/** Copies answers so callers cannot change the stored lists. */
const cloneAnswers = (answers: AssessmentAnswers): AssessmentAnswers =>
  Object.fromEntries(Object.entries(answers).map(([key, values]) => [key, [...values]]));
 
/**
 * Copies a record so callers cannot change the stored object through a shared reference.
 *
 * Every public read crosses this copy boundary to protect the loaded history.
 */
const clone = (record: PainAssessmentRecord): PainAssessmentRecord => ({
  ...record,
  areas: [...record.areas],
  answers: cloneAnswers(record.answers),
});

/** Builds a consistent key for a set of pain areas. */
export function painAreaKey(areas: string[]) {
  // Trim, un-duplicate, and sort so "Back, Knee" items always have one stable key.
  return JSON.stringify([...new Set(areas.map((area) => area.trim()).filter(Boolean))].sort());
}
