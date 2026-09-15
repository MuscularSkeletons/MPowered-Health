import { validAnswer } from '@/shared/forms/validation';
import type { RegistrationDraft } from '../form-data/draft';
import { Step } from './types';

/** Checks that the required fields and choices are complete before continuing. */
export function isStepReady(question: Step, step: number, draft: RegistrationDraft) {
  return (
    (!question.options || question.optionsOptional || !!draft.values[step]?.length) &&
    (question.fields?.every((field) => validAnswer(field, draft.fields[`${step}-${field}`])) ??
      true)
  );
}
