import { getPainHistory, painRecordDate, clearPainHistoryMemory } from './pain-history';
// This file tracks assessment answers and completion during the current app session.
import type { AssessmentAnswers, AssessmentId } from '@/shared/health-records/assessment-types';
const completedAssessments = new Set<AssessmentId>();
const assessmentAnswers = new Map<AssessmentId, AssessmentAnswers>();
const assessmentUpdatedAt = new Map<AssessmentId, Date>();
let weeklyStreak = 3;

function cloneAnswers(answers: AssessmentAnswers): AssessmentAnswers {
  // Copy every answer list so screens cannot mutate stored answers by reference.
  return Object.fromEntries(Object.entries(answers).map(([step, values]) => [step, [...values]]));
}

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

// Return the date of the most recently completed assessment for profile headers.
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

export function getCompletedAssessments() {
  // Convert the private Set into a caller-owned list.
  return [...completedAssessments];
}

export function getAssessmentAnswers(type: AssessmentId) {
  // Missing assessments return undefined; completed ones return a safe copy.
  const answers = assessmentAnswers.get(type);
  return answers ? cloneAnswers(answers) : undefined;
}

export function getWeeklyStreak() {
  // The dashboard reads the current session value without gaining write access.
  return weeklyStreak;
}

// Remove all in-memory health data when the local account is deleted.
export function resetAssessmentSession() {
  clearPainHistoryMemory();
  painRecords.splice(0);
  completedAssessments.clear();
  assessmentAnswers.clear();
  assessmentUpdatedAt.clear();
  weeklyStreak = 0;
}

export type PainRecord = { date: string; score: number };
const painRecords: PainRecord[] = [
  // These sample points keep the dashboard useful before a person records real results.
  { date: '25/05', score: 5 },
  { date: '01/06', score: 5 },
  { date: '08/06', score: 7 },
];
export function getPainRecords() {
  // Real saved history replaces the starter chart as soon as a result exists.
  const saved = getPainHistory();
  if (saved.length)
    return saved.map((record) => ({ date: painRecordDate(record, true), score: record.average }));
  return [...painRecords];
}
