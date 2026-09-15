/** Turns a pain score into the label shown beside the input. */
import type { AssessmentQuestion } from '@/shared/health-records/assessment-types';
import { asSentence } from '@/shared/health-records/format';
import { ScoreSlider } from './ScoreSlider';
import { s } from '../styles';
import { Pressable, Text, TextInput, View } from 'react-native';

/** Turns a pain score into the label shown beside the input. */
const painLabel = (n: number) =>
  n === 0
    ? 'I have no pain at all'
    : n <= 3
      ? 'The pain is very mild'
      : n <= 6
        ? 'The pain is moderate'
        : n <= 8
          ? 'The pain is fairly severe'
          : n === 9
            ? 'The pain is extremely severe'
            : 'The pain is the worst imaginable';

/** Chooses the appropriate input control for the current assessment question. */
export function QuestionInput({
  question: q,
  value: current,
  onChange: select,
}: {
  question: AssessmentQuestion;
  value: string[];
  onChange: (value: string) => void;
}) {
  return (
    <>
      {q.kind === 'score' ? (
        <>
          <View style={s.score}>
            <Text style={s.scoreNumber}>{current[0] ?? '0 to 10'}</Text>
            <Text style={s.scoreLabel}>
              {current.length ? painLabel(Number(current[0])) : 'Slide to select a value'}
            </Text>
          </View>
          <ScoreSlider value={Number(current[0] ?? 0)} onChange={(n) => select(String(n))} />
        </>
      ) : q.kind === 'text' || q.kind === 'number' ? (
        <TextInput
          value={current[0] ?? ''}
          // The movement activity-hours answer is a whole-number field. Filter
          // pasted and typed input as well as setting the numeric keyboard so
          // letters, decimals, signs, and spaces can never be recorded.
          onChangeText={(text) => select(q.kind === 'number' ? text.replace(/\D/g, '') : text)}
          keyboardType={q.kind === 'number' ? 'numeric' : 'default'}
          inputMode={q.kind === 'number' ? 'numeric' : 'text'}
          maxLength={q.kind === 'number' ? 2 : undefined}
          multiline={q.kind === 'text'}
          placeholder={q.kind === 'number' ? 'input number only' : 'Write your reflection'}
          placeholderTextColor="#81798A"
          style={[
            s.input,
            q.kind === 'text' && {
              minHeight: 150,
            },
          ]}
        />
      ) : (
        <View style={s.options}>
          {q.options?.map((o) => {
            const on = current.includes(o);
            return (
              <Pressable key={o} onPress={() => select(o)} style={[s.option, on && s.optionOn]}>
                <Text style={[s.optionText, on && s.optionTextOn]}>{asSentence(o)}</Text>
                <View style={[q.kind === 'single' ? s.radio : s.box, on && s.markOn]}>
                  <Text style={s.tick}>{on ? '✓' : ''}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}
