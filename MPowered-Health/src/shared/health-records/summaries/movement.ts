import type { AssessmentAnswers, SummarySection } from '@/shared/health-records/assessment-types';

/** Turns the movement answers into readable summary sections. */
export function summarize(answers: AssessmentAnswers): SummarySection[] {
  /** Reads the answer list for a question, using an empty list when it is missing. */
  const a = (i: number) => answers[i] ?? [];

  return [
    {
      title: 'Average activity hours:',
      text: `Last week, I was able to stay active for approximately ${a(0)[0] ?? 0} hours.`,
    },
    { title: 'General movement:', text: a(1).join(' and ') },
    { title: 'Walking:', text: a(2)[0] ?? '' },
    { title: 'Lifting:', text: a(3)[0] ?? '' },
    { title: 'Sitting:', text: a(4)[0] ?? '' },
    { title: 'Standing:', text: a(5)[0] ?? '' },
    { title: 'My reflections:', text: a(6)[0] ?? '' },
  ];
}
