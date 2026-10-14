import { painQuestions } from './painQuestions';
import { movementQuestions } from './movementQuestions';
import { personalCareQuestions } from './personalCareQuestions';
import { socialHealthQuestions } from './socialHealthQuestions';
import { managementQuestions } from './managementQuestions';

export const ASSESSMENT_QUESTIONS = {
  'My Pain': painQuestions,
  'My Movement': movementQuestions,
  'My Personal Care': personalCareQuestions,
  'My Social Health': socialHealthQuestions,
  'My Management': managementQuestions,
};