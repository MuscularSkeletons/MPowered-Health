/** Keeps assessment answers and completion information for the current app session. */
import { getPainHistory, painRecordDate, clearPainHistoryMemory } from './pain-history';
import type { AssessmentAnswers, AssessmentId } from '@/shared/health-records/assessment-types';
const completedAssessments = new Set<AssessmentId>();
const assessmentAnswers = new Map<AssessmentId, AssessmentAnswers>();
const assessmentUpdatedAt = new Map<AssessmentId, Date>();
let weeklyStreak = 3;

/** Copies each answer list so callers cannot alter the saved answers. */
function cloneAnswers(answers: AssessmentAnswers): AssessmentAnswers {
  // Copy every answer list so screens cannot mutate stored answers by reference.
  return Object.fromEntries(Object.entries(answers).map(([step, values]) => [step, [...values]]));
}

/** Records completion and keeps a copy of the assessment answers. */
export function markAssessmentCompleted(
  type: AssessmentId,
  answers?: AssessmentAnswers,
  completedAt = new Date(),
) {
  // Completion, timestamp, and answers are updated together for consistent summaries.
  completedAssessments.add(type);
  assessmentUpdatedAt.set(type, completedAt);
  if (answers) assessmentAnswers.set(type, cloneAnswers(answers));
}

/**
 * Returns the most recent completion date across all assessments.
 *
 * Return the date of the most recently completed assessment for profile headers.
 */
export function getLatestAssessmentDate() {
  const dates = [...assessmentUpdatedAt.values()];
  if (!dates.length) return '';
  return dates
    .reduce((latest, date) => (date > latest ? date : latest))
    .toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
}

/** Returns the assessment types completed in the current session. */
export function getCompletedAssessments() {
  // Convert the private Set into a caller-owned list.
  return [...completedAssessments];
}

/** Returns the saved answers for an assessment. */
export function getAssessmentAnswers(type: AssessmentId) {
  // Missing assessments return undefined; completed ones return a safe copy.
  const answers = assessmentAnswers.get(type);
  return answers ? cloneAnswers(answers) : undefined;
}

/** Returns the current prototype streak value; this does not calculate a streak from history. */
export function getWeeklyStreak() {
  // The dashboard reads the current session value without gaining write access.
  return weeklyStreak;
}

/**
 * Clears assessment answers and completion information held in memory.
 *
 * Remove all in-memory health data when the local account is deleted.
 */
export function resetAssessmentSession() {
  clearPainHistoryMemory();
  painRecords.splice(0);
  completedAssessments.clear();
  assessmentAnswers.clear();
  assessmentUpdatedAt.clear();
  weeklyStreak = 0;
}

export type PainRecord = { date: string; score: number };
const painRecords: PainRecord[] = [];

/** Returns the pain records used by the session summaries. */
export function getPainRecords() {
  // Real saved history replaces the starter chart as soon as a result exists.
  const saved = getPainHistory();
  if (saved.length)
    return saved.map((record) => ({ date: painRecordDate(record, true), score: record.average }));
  return [...painRecords];
}
