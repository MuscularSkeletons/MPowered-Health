const scoreImpact = (value: string, subject: string) => {
  const n = Number(value);
  if (n === 0) return `Pain does not impact my ${subject} at all.`;
  if (n <= 3) return `Pain slightly affects my ${subject}.`;
  if (n <= 6) return `Pain moderately affects my ${subject}.`;
  if (n <= 8) return `Pain substantially impacts my ${subject}.`;
  return `Pain completely impacts my ${subject}.`;
};
// Add punctuation only when the supplied text does not already have it.
export const asSentence = (value: string) => {
  if (!value || /[.!?]$/.test(value)) return value;
  const isCompleteStatement =
    /^(I |My |Pain |Because |Are |What |Is |How |Would |Should |Even |There |It |Last week)/.test(
      value,
    );
  return isCompleteStatement ? `${value}.` : value;
};
// Convert stored answer indexes into labelled sections for the final summary.
export function buildSummary(type: string, answers: Record<number, string[]>) {
  const a = (i: number) => answers[i] ?? [];
  if (type === 'pain') {
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
  if (type === 'movement')
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
  if (type === 'personal')
    return [
      { title: 'General activities:', text: a(0).join(', ') },
      {
        title: 'Personal care (washing, dressing, etc.):',
        text: a(1)[0] ?? '',
      },
      { title: 'Sleeping:', text: a(2)[0] ?? '' },
      { title: 'My reflections:', text: a(3)[0] ?? '' },
    ];
  if (type === 'social')
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
