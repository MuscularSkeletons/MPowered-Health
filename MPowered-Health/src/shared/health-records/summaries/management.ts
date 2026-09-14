import type { AssessmentAnswers, SummarySection } from '@/shared/health-records/assessment-types';

export function summarize(answers: AssessmentAnswers): SummarySection[] {
  const a = (i: number) => answers[i] ?? [];
  return [
    {
      title: 'Medication:',
      text: a(0).length
        ? `You only consumed ${a(0).join(', ')} this week.`
        : 'You did not record any medication this week.',
    },
    {
      title: 'Exercise:',
      text: a(2)[0]
        ? `You exercised for ${a(2)[0]} this week.`
        : 'No exercise was recorded this week.',
    },
    {
      title: 'Emotion:',
      text: a(3)[0] || 'You did not perform any dedicated strategy to manage your mood.',
    },
  ];
}
