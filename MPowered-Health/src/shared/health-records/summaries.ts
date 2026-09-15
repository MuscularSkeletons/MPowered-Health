/** Chooses the summary builder for the requested assessment. */
import { summarize as pain } from '@/shared/health-records/summaries/pain';
import { summarize as movement } from '@/shared/health-records/summaries/movement';
import { summarize as personal } from '@/shared/health-records/summaries/personal-care';
import { summarize as social } from '@/shared/health-records/summaries/social-health';
import { summarize as management } from '@/shared/health-records/summaries/management';
import type { AssessmentId, AssessmentAnswers } from '@/shared/health-records/assessment-types';
export { asSentence } from '@/shared/health-records/format';
const summaries = { pain, movement, personal, social, management };

/** Chooses the summary builder for the requested assessment. */
export function buildSummary(type: AssessmentId, answers: AssessmentAnswers) {
  return summaries[type](answers);
}
