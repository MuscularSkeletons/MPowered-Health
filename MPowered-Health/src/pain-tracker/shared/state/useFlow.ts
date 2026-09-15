/** Manages question progress and saves the completed assessment before showing results. */
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
  persist?: (answers: AssessmentAnswers) => Promise<unknown>;
}

// Owns one mounted assessment's draft; presentation and storage policy are supplied by its feature.
/**
 * Manages question progress and saves the completed assessment before showing results.
 *
 * @param options - Assessment questions, summary builder, and optional save function.
 * @returns Current answers, progress, validation, and actions for the screen.
 * A failed save leaves answers available for retry; repeated Continue taps cannot start another save.
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
