// Application-facing session API; cleanup composes the independent stores.
import { resetAssessmentSession as resetAnswers } from '@/features/pain-tracker/shared/assessment/state/session-store';
import { clearPainHistoryMemory } from './my-pain/history';
import { resetPainTrend } from './my-pain/trend';
export {
  getAssessmentAnswers,
  getCompletedAssessments,
  getLatestAssessmentDate,
  getWeeklyStreak,
  markAssessmentCompleted,
} from '@/features/pain-tracker/shared/assessment/state/session-store';
export { getPainRecords, type PainRecord } from './my-pain/trend';
export function resetAssessmentSession() {
  resetAnswers();
  clearPainHistoryMemory();
  resetPainTrend();
}
