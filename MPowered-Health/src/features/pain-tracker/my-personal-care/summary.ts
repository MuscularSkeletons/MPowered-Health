import type {
  AssessmentAnswers,
  SummarySection,
} from '@/features/pain-tracker/shared/assessment/types';

export function summarize(answers: AssessmentAnswers): SummarySection[] {
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
