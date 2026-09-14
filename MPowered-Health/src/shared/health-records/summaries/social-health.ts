import type { AssessmentAnswers, SummarySection } from '@/shared/health-records/assessment-types';
const scoreImpact = (value: string, subject: string) => {
  const n = Number(value);
  if (n === 0) return `Pain does not impact my ${subject} at all.`;
  if (n <= 3) return `Pain slightly affects my ${subject}.`;
  if (n <= 6) return `Pain moderately affects my ${subject}.`;
  if (n <= 8) return `Pain substantially impacts my ${subject}.`;
  return `Pain completely impacts my ${subject}.`;
};
export function summarize(answers: AssessmentAnswers): SummarySection[] {
  const a = (i: number) => answers[i] ?? [];
  return [
    { title: 'Social life:', text: a(0)[0] ?? '' },
    { title: 'Travelling:', text: a(1)[0] ?? '' },
    { title: 'Mood:', text: scoreImpact(a(2)[0] ?? '0', 'mood') },
    {
      title: 'Relation with others:',
      text: scoreImpact(a(3)[0] ?? '0', 'relationships with others'),
    },
    {
      title: 'Enjoyment of life:',
      text: scoreImpact(a(4)[0] ?? '0', 'ability to enjoy life'),
    },
    { title: 'My reflections on mood:', text: a(6)[0] ?? a(5)[0] ?? '' },
  ];
}
