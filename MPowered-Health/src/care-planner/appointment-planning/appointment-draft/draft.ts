/** Defines the appointment draft, its update rules, and how to build a completed plan. */
import { parseQuestions } from './legacy-link-parser';
import type { AppointmentQuestion } from '@/care-planner/appointments/types';
export interface AppointmentDraft {
  // Stored as the displayed day/month/year text, rather than a Date object.
  date: string;
  doctor: string;
  service: string;
  // Keep selected text here; the final plan restores each question’s category.
  questions: string[];
  customQuestion: string;
}
export type AppointmentDraftAction =
  | { type: 'field'; field: 'date' | 'doctor' | 'service' | 'customQuestion'; value: string }
  | { type: 'toggleQuestion'; value: string }
  | { type: 'skipQuestions' };

/** Creates a blank appointment plan. */
export const emptyAppointmentDraft = (): AppointmentDraft => ({
  date: '',
  doctor: '',
  service: '',
  questions: [],
  customQuestion: '',
});

/**
 * Updates the appointment draft without changing the previous draft.
 *
 * @param draft - Previous form values; this object is not changed.
 * @param action - Field edit, question toggle, or question skip.
 * @returns Updated values for the next render.
 */
export function appointmentDraftReducer(
  draft: AppointmentDraft,
  action: AppointmentDraftAction,
): AppointmentDraft {
  if (action.type === 'field') return { ...draft, [action.field]: action.value };
  // Skipping suggested questions leaves the separately entered custom question unchanged.
  if (action.type === 'skipQuestions') return { ...draft, questions: [] };
  return {
    ...draft,
    questions: draft.questions.includes(action.value)
      ? draft.questions.filter((q) => q !== action.value)
      : [...draft.questions, action.value],
  };
}

/**
 * Restores supported values from an old appointment link.
 *
 * @param params - Values from an old planning link. Without resume, a blank draft is returned.
 * @returns A draft with safe defaults and a validated question list.
 */
export function restoreAppointmentDraft(
  params: Record<string, string | undefined>,
): AppointmentDraft {
  if (!params.resume) return emptyAppointmentDraft();
  return {
    date: params.date ?? '',
    doctor: params.doctor ?? '',
    service: params.service === 'Not added' ? '' : (params.service ?? ''),
    questions: parseQuestions(params.questions),
    customQuestion: params.customQuestion ?? '',
  };
}

/** Checks that the appointment has the required date and provider information. */
export function appointmentDetailsReady(draft: AppointmentDraft) {
  return !!draft.date.trim() && !!draft.doctor.trim();
}

/**
 * Combines the entered appointment details with the selected questions.
 *
 * @param draft - Current appointment details and selected question text.
 * @param suggestions - Suggested questions with their original categories.
 * @returns The plan to add to appointments, including any custom question.
 */
export function buildAppointmentPlan(draft: AppointmentDraft, suggestions: AppointmentQuestion[]) {
  const questions = draft.questions.map(
    (text) => suggestions.find((q) => q.text === text) ?? { group: 'Other', text },
  );
  if (draft.customQuestion.trim())
    questions.push({ group: 'Other', text: draft.customQuestion.trim() });
  return {
    doctor: draft.doctor.trim() || 'Healthcare practitioner',
    date: draft.date || 'Date not specified',
    service: draft.service || 'Not added',
    questions,
  };
}
