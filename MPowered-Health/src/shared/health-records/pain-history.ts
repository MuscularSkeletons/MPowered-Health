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

/**
 * Loads the account's history (18 months) from db into memory.
 *
 * @throws If the request fails, so session boundary can retry.
 */
export async function loadPainHistory() {
  const requestGeneration = generation;
  const userId = accountId;
  if (!userId) {
    records = [];
    latest = {};
    return;
  }
  const snapshot = await fetchHealthSnapshot(userId);
  // The account changed while the request was running - so then drop the result and not show it.
  if (requestGeneration !== generation) return;
  records = snapshot.painRecords;
  latest = snapshot.latest;
}

/**
 * Snce sssessments are submitted by  assessment feature, (which writes to supabase), this
 * exports so existing imports compile, and fails if not.
 */
export async function savePainAssessment(
  _answers: AssessmentAnswers,
  _now = new Date(),
): Promise<PainAssessmentRecord> {
  throw new Error('Pain assessments are saved by the assessment feature, not by My Health.');
}
 
/** Nothing is written locally, so no need to wait for saves. */
export async function finishPainHistoryWrites() {}
 
/** Clears the pain records in memory rn. */
export function clearPainHistoryMemory() {
  // Clear the session copy after account deletion or reset.
  records = [];
  latest = {};
}


/**
 * Returns copies of the current pain-history records, oldest first.
 *
 * @returns New record and answer objects that callers can sort or edit w/o changing loaded history.
 */
export function getPainHistory() {
  // Screens receive copies and can sort or filter them safely!
  return records.map(clone);
}
 
/** The newest answers for each assessment type, for restoring the profile and summaries. */
export function getLatestAssessmentAnswers(): HealthSnapshot['latest'] {
  return Object.fromEntries(
    Object.entries(latest).map(([type, entry]) => [
      type,
      { completedAt: entry.completedAt, answers: cloneAnswers(entry.answers) },
    ]),
  );
}


