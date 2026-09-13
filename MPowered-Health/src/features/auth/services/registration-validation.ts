import { validAnswer } from '@/shared/forms/validation';
import type { RegistrationDraft } from '../models/registration-draft';
import { Step } from '../models/registration-step';
export function isStepReady(question: Step, step: number, draft: RegistrationDraft) {
  return (
    (!question.options || question.optionsOptional || !!draft.values[step]?.length) &&
    (question.fields?.every((field) => validAnswer(field, draft.fields[`${step}-${field}`])) ??
      true)
  );
}
