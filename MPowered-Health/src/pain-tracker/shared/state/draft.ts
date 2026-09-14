import type {
  AssessmentAnswers,
  AssessmentQuestion,
} from '@/shared/health-records/assessment-types';

export interface AssessmentDraft {
  step: number;
  answers: AssessmentAnswers;
  status: 'answering' | 'saving' | 'complete';
  error: string;
}
export type AssessmentAction =
  | { type: 'select'; value: string; multiple: boolean }
  | { type: 'advance'; questionCount: number; fromStep: number }
  | { type: 'back' }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'failed'; message: string }
  | { type: 'restart' };

export function createAssessmentDraft(answers?: AssessmentAnswers): AssessmentDraft {
  return { step: 0, answers: answers ?? {}, status: answers ? 'complete' : 'answering', error: '' };
}

export function assessmentDraftReducer(
  state: AssessmentDraft,
  action: AssessmentAction,
): AssessmentDraft {
  if (state.status === 'saving' && action.type !== 'saved' && action.type !== 'failed')
    return state;
  switch (action.type) {
    case 'select': {
      const current = state.answers[state.step] ?? [];
      const values = action.multiple
        ? current.includes(action.value)
          ? current.filter((value) => value !== action.value)
          : [...current, action.value]
        : [action.value];
      return { ...state, answers: { ...state.answers, [state.step]: values } };
    }
    case 'advance':
      if (state.step !== action.fromStep) return state;
      return { ...state, step: Math.min(state.step + 1, action.questionCount - 1) };
    case 'back':
      return { ...state, step: Math.max(0, state.step - 1) };
    case 'saving':
      return { ...state, status: 'saving', error: '' };
    case 'saved':
      return { ...state, status: 'complete' };
    case 'failed':
      return { ...state, status: 'answering', error: action.message };
    // Preserve existing answers so a repeat assessment can revise the previous record.
    case 'restart':
      return { ...state, step: 0, status: 'answering', error: '' };
  }
}

export function questionAnswered(question: AssessmentQuestion, values: string[]): boolean {
  if (question.optional) return true;
  if (!values.length || values.some((value) => !value.trim())) return false;
  if (question.kind === 'number') return /^\d{1,2}$/.test(values[0]);
  if (question.kind === 'score') return /^\d+$/.test(values[0]) && Number(values[0]) <= 10;
  return true;
}
