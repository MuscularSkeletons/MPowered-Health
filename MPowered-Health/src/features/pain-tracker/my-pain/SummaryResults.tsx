import { s } from '@/features/pain-tracker/shared/assessment/styles';
import { Text, View } from 'react-native';
export function PainSummaryResults({ answers }: { answers: Record<number, string[]> }) {
  const value = (index: number) => answers[index]?.[0] ?? '0';
  const statement = (index: number, kind: 'current' | 'mildest' | 'worst' | 'average') => {
    const score = Number(value(index));
    if (score === 0)
      return kind === 'current'
        ? 'I do not experience pain at the moment.'
        : 'I had no pain at all.';
    const level =
      score <= 3 ? 'mild' : score <= 6 ? 'moderate' : score <= 8 ? 'severe' : 'very severe';
    if (kind === 'current') return `I currently experience ${level} pain.`;
    if (kind === 'worst') return `My worst pain was ${level}.`;
    return `I have experienced ${level} pain.`;
  };
  const intensity = [
    { label: 'Current pain', index: 2, kind: 'current' as const },
    { label: 'Mildest pain', index: 3, kind: 'mildest' as const },
    { label: 'Worst pain', index: 4, kind: 'worst' as const },
    { label: 'Average pain', index: 5, kind: 'average' as const },
  ];
  return (
    <>
      <View style={[s.painSection, s.painSectionFirst]}>
        <Text style={s.painSectionTitle}>Pain location</Text>
        <Text style={s.result}>I have pain in the following areas:</Text>
        <Text style={s.resultValue}>{answers[0]?.join('\n') || 'No location recorded.'}</Text>
      </View>
      <View style={s.painSection}>
        <Text style={s.painSectionTitle}>Pain characteristics</Text>
        <Text style={s.result}>
          My pain was: {answers[1]?.join(', ').toLowerCase() || 'not recorded'}.
        </Text>
      </View>
      <View style={s.painSection}>
        <Text style={s.painSectionTitle}>Pain intensity</Text>
        {intensity.map((item) => (
          <View key={item.label} style={s.intensityItem}>
            <Text style={s.intensityLabel}>
              {item.label}: {value(item.index)}
            </Text>
            <Text style={s.result}>{statement(item.index, item.kind)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
