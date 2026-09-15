import { useReducer, useRef } from 'react';
import type {
  AssessmentId,
  AssessmentAnswers,
  AssessmentDefinition,
  SummarySection,
} from '@/shared/health-records/assessment-types';
import { asSentence } from '@/shared/health-records/format';
import { assessmentDraftReducer, createAssessmentDraft, questionAnswered } from './draft';
import { getAssessmentAnswers, markAssessmentCompleted } from '@/shared/health-records/session';

export interface AssessmentFlowOptions {
  assessmentId: AssessmentId;
  definition: AssessmentDefinition;
  summarize: (answers: AssessmentAnswers) => SummarySection[];
  // Features without this callback keep completion in the session only.
  persist?: (answers: AssessmentAnswers) => Promise<unknown>;
}

/**
 * Manages question progress and saves the completed assessment before showing results.
 *
 * The feature supplies its questions, summary wording, and optional save function.
 * A failed save keeps answers available for retry; repeated Continue taps cannot start another save.
 *
 * @param options - Assessment questions, summary builder, and optional save function.
 * @returns Current answers, progress, validation, and actions for the screen.
 */
export function useAssessmentFlow({
  assessmentId,
  definition,
  summarize,
  persist,
}: AssessmentFlowOptions) {
  const [draft, dispatch] = useReducer(assessmentDraftReducer, assessmentId, (id) =>
    createAssessmentDraft(getAssessmentAnswers(id)),
  );
  // A ref changes immediately, before React renders the disabled Continue button.
  const savingRef = useRef(false);
  const activeStep = Math.min(draft.step, definition.questions.length - 1);
  const question = definition.questions[activeStep];
  const current = draft.answers[activeStep] ?? [];
  const valid = questionAnswered(question, current);

  /** Advances one answered question, or saves the completed assessment while blocking duplicate submissions. */
  const next = async () => {
    if (savingRef.current || !valid) return;
    if (activeStep < definition.questions.length - 1) {
      dispatch({
        type: 'advance',
        questionCount: definition.questions.length,
        fromStep: activeStep,
      });
      return;
    }
    savingRef.current = true;
    dispatch({ type: 'saving' });
    try {
      // Do not mark the assessment complete until the feature’s storage write succeeds.
      await persist?.(draft.answers);
      markAssessmentCompleted(assessmentId, draft.answers);
      dispatch({ type: 'saved' });
    } catch {
      dispatch({
        type: 'failed',
        message: 'Your assessment could not be saved. Please try again.',
      });
    } finally {
      savingRef.current = false;
    }
  };

  return {
    activeStep,
    question,
    current,
    answers: draft.answers,
    valid,
    done: draft.status === 'complete',
    saving: draft.status === 'saving',
    saveError: draft.error,
    select: (value: string) =>
      dispatch({ type: 'select', value, multiple: question.kind === 'multi' }),
    back: () => dispatch({ type: 'back' }),
    restart: () => dispatch({ type: 'restart' }),
    next,
    summarySections: summarize(draft.answers)
      .filter((section) => section.text)
      .map((section) => ({ ...section, text: asSentence(section.text) })),
  };
}
