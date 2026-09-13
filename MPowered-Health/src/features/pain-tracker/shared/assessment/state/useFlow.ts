import { useReducer, useRef } from 'react';
import type {
  AssessmentId,
  AssessmentAnswers,
  AssessmentDefinition,
  SummarySection,
} from '../types';
import { asSentence } from '../summary/format';
import { assessmentDraftReducer, createAssessmentDraft, questionAnswered } from './draft';
import { getAssessmentAnswers, markAssessmentCompleted } from './session-store';

export interface AssessmentFlowOptions {
  assessmentId: AssessmentId;
  definition: AssessmentDefinition;
  summarize: (answers: AssessmentAnswers) => SummarySection[];
  persist?: (answers: AssessmentAnswers) => Promise<unknown>;
}

// Owns one mounted assessment's draft; presentation and storage policy are supplied by its feature.
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
