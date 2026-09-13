import { summarize as pain } from './my-pain/summary';
import { summarize as movement } from './my-movement/summary';
import { summarize as personal } from './my-personal-care/summary';
import { summarize as social } from './my-social-health/summary';
import { summarize as management } from './my-management/summary';
import type {
  AssessmentId,
  AssessmentAnswers,
} from '@/features/pain-tracker/shared/assessment/types';
export { asSentence } from '@/features/pain-tracker/shared/assessment/summary/format';
const summaries = { pain, movement, personal, social, management };
export function buildSummary(type: AssessmentId, answers: AssessmentAnswers) {
  return summaries[type](answers);
}
