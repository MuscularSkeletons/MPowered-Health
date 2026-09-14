import { parseQuestions } from './legacy-link-parser';
import type { AppointmentQuestion } from '@/care-planner/appointments/types';
export interface AppointmentDraft {
  date: string;
  doctor: string;
  service: string;
  questions: string[];
  customQuestion: string;
}
export type AppointmentDraftAction =
  | { type: 'field'; field: 'date' | 'doctor' | 'service' | 'customQuestion'; value: string }
  | { type: 'toggleQuestion'; value: string }
  | { type: 'skipQuestions' };
export const emptyAppointmentDraft = (): AppointmentDraft => ({
  date: '',
  doctor: '',
  service: '',
  questions: [],
  customQuestion: '',
});
export function appointmentDraftReducer(
  draft: AppointmentDraft,
  action: AppointmentDraftAction,
): AppointmentDraft {
  if (action.type === 'field') return { ...draft, [action.field]: action.value };
  if (action.type === 'skipQuestions') return { ...draft, questions: [] };
  return {
    ...draft,
    questions: draft.questions.includes(action.value)
      ? draft.questions.filter((q) => q !== action.value)
      : [...draft.questions, action.value],
  };
}
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
export function appointmentDetailsReady(draft: AppointmentDraft) {
  return !!draft.date.trim() && !!draft.doctor.trim();
}
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
