import { painQuestions } from '@/constants/assessmentQuestions/painQuestions';
import { movementQuestions } from '@/constants/assessmentQuestions/movementQuestions';
import { personalCareQuestions } from '@/constants/assessmentQuestions/personalCareQuestions';
import { socialHealthQuestions } from '@/constants/assessmentQuestions/socialHealthQuestions';
import { managementQuestions } from '@/constants/assessmentQuestions/managementQuestions';

/** Aggregates all assessment questions into one shared constant to easily access from one constant */
export const ASSESSMENT_QUESTIONS = {
  'My Pain': painQuestions,
  'My Movement': movementQuestions,
  'My Personal Care': personalCareQuestions,
  'My Social Health': socialHealthQuestions,
  'My Management': managementQuestions,
};