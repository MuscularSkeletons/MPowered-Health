/**
 * Keeps the session in step with Supabase after the first load.
 *
 * FYI: This is in its own file because session.ts imports pain-history.ts so importing session from
 * pain-history.ts instead would make a circular import!!
 */
import type { AssessmentId } from '@/shared/health-records/assessment-types';
import { getLatestAssessmentAnswers, loadPainHistory } from './pain-history';
import { markAssessmentCompleted } from './session';

/** Marks every assessment type that has data as completed, with its latest answers and date. */
export function restoreAssessmentSession() {
  const latest = getLatestAssessmentAnswers();
  (Object.keys(latest) as AssessmentId[]).forEach((type) => {
    const entry = latest[type]!;
    markAssessmentCompleted(type, entry.answers, new Date(entry.completedAt));
  });
}

/**
 * Reloads the accounts history from Supabase and refreshes the session.
 *
 * !! Call it when a My Health screen gains focus, then re-read the history (getPainHistory,
 * getAssessmentWeeks). If the request fails this rejects and the data already loaded stays in
 * place, so a screen can keep showing it. Prescriptions are not refreshed here bc only the
 * prescription store changes them, and it updates its own list.
 */
export async function refreshHealthRecords() {
  await loadPainHistory();
  restoreAssessmentSession();
}