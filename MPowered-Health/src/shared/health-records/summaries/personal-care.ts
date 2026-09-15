/** Turns the personal care answers into readable summary sections. */
import type { AssessmentAnswers, SummarySection } from '@/shared/health-records/assessment-types';

/** Turns the personal care answers into readable summary sections. */
export function summarize(answers: AssessmentAnswers): SummarySection[] {
  /** Reads the answer list for a question, using an empty list when it is missing. */
  const a = (i: number) => answers[i] ?? [];

  return [
    { title: 'General activities:', text: a(0).join(', ') },
    {
      title: 'Personal care (washing, dressing, etc.):',
      text: a(1)[0] ?? '',
    },
    { title: 'Sleeping:', text: a(2)[0] ?? '' },
    { title: 'My reflections:', text: a(3)[0] ?? '' },
  ];
}
