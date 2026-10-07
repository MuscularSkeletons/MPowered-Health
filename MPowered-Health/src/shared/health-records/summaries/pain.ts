import type { AssessmentAnswers, SummarySection } from '@/shared/health-records/assessment-types';

/** Turns the pain answers into readable summary sections. */
export function summarize(answers: AssessmentAnswers): SummarySection[] {
  /** Reads the answer list for a question, using an empty list when it is missing. */
  const a = (i: number) => answers[i] ?? [];

  /** Turns a recorded pain score into readable summary wording. */
  const painSentence = (value: string, kind: string) => {
    const n = Number(value);
    const level = n <= 3 ? 'mild' : n <= 6 ? 'moderate' : n <= 8 ? 'severe' : 'very severe';
    return kind === 'Current Pain'
      ? n === 0
        ? 'I do not experience pain at the moment.'
        : `I currently experience ${level} pain.`
      : kind === 'Worst pain'
        ? `My worst pain was ${level}.`
        : `I have experienced ${level} pain.`;
  };

  return [
    {
      title: 'Pain location',
      text: `I have pain in the following areas: ${a(0).join(', ')}`,
    },
    {
      title: 'Pain characteristics',
      text: `Words describing my pain: ${a(1).join(', ').toLowerCase()}`,
    },
    {
      title: `Current pain: ${a(2)[0] ?? 0}`,
      text: painSentence(a(2)[0] ?? '0', 'Current Pain'),
    },
    {
      title: `Mildest pain: ${a(3)[0] ?? 0}`,
      text: painSentence(a(3)[0] ?? '0', 'Mildest pain'),
    },
    {
      title: `Worst pain: ${a(4)[0] ?? 0}`,
      text: painSentence(a(4)[0] ?? '0', 'Worst pain'),
    },
    {
      title: `Average pain: ${a(5)[0] ?? 0}`,
      text: painSentence(a(5)[0] ?? '0', 'Average pain'),
    },
  ];
}
