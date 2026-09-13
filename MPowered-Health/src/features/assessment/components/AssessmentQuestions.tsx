import { s } from './AssessmentScreen.styles';
// This screen guides the user through health assessments and saves their answers.
import { useEffect, useRef, useState } from 'react';
import { Linking, PanResponder, Pressable, Text, View } from 'react-native';
// A question describes its prompt, choices, and special input behavior.
// Reuse ordered answer scales across questions that measure similar impacts.
// Group a zero-to-ten impact score into a short, readable sentence.
// Present the main pain scores together so they are easy to compare.
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

// Pair a result with one practical tip and an optional trusted resource.
export function SummaryInsight({
  summary,
  tip,
  url,
}: {
  summary: string;
  tip: string;
  url: string;
}) {
  return (
    <View style={s.summaryInsight}>
      <View style={s.summaryStatement}>
        <Text style={s.summaryStatementText}>{summary}</Text>
      </View>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [s.guideButton, pressed && s.guidePressed]}
        onPress={() => Linking.openURL(url)}
      >
        <Text style={s.guideIcon}>⌕</Text>
        <Text style={s.guideText}>{tip}</Text>
        <Text style={s.guideArrow}>›</Text>
      </Pressable>
    </View>
  );
}
// Support taps and drags while keeping the score between zero and ten.
export function ScoreSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<View>(null);
  // Cache the track position so pointer movement can become a score.
  const metrics = useRef({ left: 0, width: 1, ready: false });
  const lastValue = useRef(value);
  useEffect(() => {
    lastValue.current = value;
  }, [value]);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  // Screen coordinates stay stable while the thumb moves beneath the user's finger.
  // Using locationX here causes the score to jump when the touch target changes.
  // Clamp the pointer to the track and round to a whole-number score.
  const updateFromPageX = (pageX: number) => {
    if (!metrics.current.ready) return;
    const next = Math.max(
      0,
      Math.min(10, Math.round(((pageX - metrics.current.left) / metrics.current.width) * 10)),
    );
    if (next !== lastValue.current) {
      lastValue.current = next;
      onChangeRef.current(next);
    }
  };
  const measureTrack = (pageX?: number) =>
    trackRef.current?.measureInWindow((left, _top, width) => {
      metrics.current = { left, width: Math.max(width, 1), ready: true };
      if (pageX != null) updateFromPageX(pageX);
    });
  // Keep one gesture responder for the full drag.
  // PanResponder stores these callbacks; refs are read only during a gesture.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => measureTrack(event.nativeEvent.pageX),
      onPanResponderMove: (event) => updateFromPageX(event.nativeEvent.pageX),
      onPanResponderTerminationRequest: () => false,
    }),
  );
  return (
    <View style={s.sliderArea}>
      <View
        ref={trackRef}
        collapsable={false}
        onLayout={() => measureTrack()}
        {...pan.panHandlers}
        style={s.sliderTrack}
      >
        <View pointerEvents="none" style={[s.sliderFill, { width: `${value * 10}%` }]} />
        <View pointerEvents="none" style={[s.sliderThumb, { left: `${value * 10}%` }]}>
          <View style={s.sliderBubble}>
            <Text style={s.sliderBubbleText}>{value}</Text>
          </View>
        </View>
      </View>
      <View style={s.sliderEnds}>
        <Text style={s.sliderEnd}>0</Text>
        <Text style={s.sliderEnd}>10</Text>
      </View>
    </View>
  );
}
