import { asSentence, buildSummary } from '@/features/assessment/services/summary';
import { PainSummaryResults, ScoreSlider, SummaryInsight } from '../components/AssessmentQuestions';
import { s } from '../components/AssessmentScreen.styles';
import { specs, tipUrls } from '../models/specs';
// This screen guides the user through health assessments and saves their answers.
import {
  getAssessmentAnswers,
  markAssessmentCompleted,
} from '@/features/assessment/state/assessment-session';
import {
  getPainHistory,
  painRecordDate,
  savePainAssessment,
} from '@/features/pain/services/pain-history';
import { ActionButton, MhaHeader } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
// A question describes its prompt, choices, and special input behavior.
// Reuse ordered answer scales across questions that measure similar impacts.
// Run one assessment from its first question through saving and summary.
export default function Assessment() {
  const { type = 'pain' } = useLocalSearchParams<{ type?: string }>();
  return <AssessmentContent key={type} />;
}
function AssessmentContent() {
  const {
    type = 'pain',
    completed = '',
    name = 'Jane',
  } = useLocalSearchParams<{
    type: string;
    completed?: string;
    name?: string;
  }>();
  // Use the pain assessment if a route contains an unknown type.
  const spec = specs[type] ?? specs.pain;
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Record<number, string[]>>(
      () => getAssessmentAnswers(type) ?? {},
    ),
    [done, setDone] = useState(() => Boolean(getAssessmentAnswers(type)));
  const scrollRef = useRef<ScrollView>(null);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step, type]);
  const activeStep = Math.min(step, spec.questions.length - 1),
    q = spec.questions[activeStep],
    current = answers[activeStep] ?? [];
  // Required questions block Continue until the user provides an answer.
  const valid = q.optional || current.length > 0;
  const select = (v: string) =>
    setAnswers((a) => ({
      ...a,
      [activeStep]:
        q.kind === 'multi'
          ? current.includes(v)
            ? current.filter((x) => x !== v)
            : [...current, v]
          : [v],
    }));
  // Advance through questions first, then save once on the final step.
  const next = async () => {
    if (savingRef.current) return;
    if (activeStep < spec.questions.length - 1) {
      setStep(activeStep + 1);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      // Pain answers also create a dated history record before completion.
      if (type === 'pain') await savePainAssessment(answers);
      markAssessmentCompleted(type, answers);
      setDone(true);
    } catch {
      setSaveError('Your assessment could not be saved. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  // Build results from the answers and the latest dated pain record.
  const latestPain = getPainHistory().at(-1);
  const result = useMemo(() => Object.values(answers).flat(), [answers]);
  const summarySections = buildSummary(type, answers)
    .filter((section) => section.text)
    .map((section) => ({ ...section, text: asSentence(section.text) }));
  // Return to the requested page with the updated completion list.
  const closeSummary = () => {
    const all = [...new Set([...completed.split(',').filter(Boolean), type])].join(',');
    router.replace({
      pathname: '/dashboard',
      params: { completed: all, name },
    });
  };
  // Show read-only results after the save has finished.
  if (done)
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <MhaHeader />
        <ScrollView contentContainerStyle={s.summary}>
          <Text style={s.summaryTitle}>My Pain Summary</Text>
          <Text style={s.summaryCopy}>
            {type === 'pain'
              ? spec.summary
              : 'Your answers help your doctor focus on what matters most to your daily life.'}
          </Text>
          <View style={s.resultCard}>
            <View style={s.summaryMeta}>
              <Text style={[s.resultHeading, { marginBottom: 0, lineHeight: 20 }]}>
                {spec.title}
              </Text>
              <Text style={s.period}>
                {type === 'pain'
                  ? latestPain
                    ? `Recorded ${painRecordDate(latestPain)}`
                    : 'My Pain assessment'
                  : 'Period: 18–24 May'}
              </Text>
            </View>
            {type !== 'pain' ? (
              <SummaryInsight summary={spec.summary} tip={spec.tip} url={tipUrls[type]} />
            ) : null}
            {type !== 'pain' ? (
              <Text style={[s.resultHeading, s.headingDivider]}>My results:</Text>
            ) : null}
            {type === 'pain' ? (
              <PainSummaryResults answers={answers} />
            ) : (
              summarySections.map((section, i) => (
                <View key={i} style={s.resultSection}>
                  <Text
                    style={
                      section.title.startsWith('My reflections')
                        ? [s.resultHeading, s.headingDivider]
                        : s.resultLabel
                    }
                  >
                    {section.title}
                  </Text>
                  <Text style={s.result}>{section.text}</Text>
                </View>
              ))
            )}
            {!result.length ? <Text style={s.result}>No items recorded this week.</Text> : null}
          </View>
          <View style={s.summaryFooter}>
            <Text style={s.saved}>
              {type === 'pain' ? 'Saved to My Health' : 'Saved to Care Journal'}
            </Text>
            {type === 'pain' ? (
              <Pressable
                accessibilityRole="button"
                style={s.closeButton}
                onPress={() => {
                  setDone(false);
                  setStep(0);
                  setSaveError('');
                }}
              >
                <Text style={s.closeText}>Record new assessment</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={closeSummary}
              style={({ pressed }) => [s.closeButton, pressed && s.closePressed]}
            >
              <Text style={s.closeText}>Close</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.top}>
            <Pressable
              onPress={() =>
                activeStep
                  ? setStep(activeStep - 1)
                  : router.replace({
                      pathname: '/dashboard',
                      params: { completed, name },
                    })
              }
            >
              <Text style={s.back}>‹ Back</Text>
            </Pressable>
            <Text style={s.counter}>
              {activeStep + 1}/{spec.questions.length}
            </Text>
          </View>
          <View style={s.track}>
            <View
              style={[
                s.fill,
                {
                  width: `${((activeStep + 1) / spec.questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={s.module}>{spec.title}</Text>
          <Text style={s.title}>{q.title}</Text>
          <Text style={s.prompt}>{q.prompt}</Text>
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
          <View style={s.action}>
            <ActionButton
              label={
                saving ? 'Saving…' : activeStep === spec.questions.length - 1 ? 'Review' : 'Record'
              }
              disabled={!valid || saving}
              onPress={next}
            />
            {saveError ? (
              <Text accessibilityRole="alert" style={s.required}>
                {saveError}
              </Text>
            ) : null}
            {!valid ? <Text style={s.required}>This question is mandatory.</Text> : null}
          </View>
          {q.helper ? <Text style={s.helper}>{q.helper}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// Keep visual rules below the assessment behavior so the flow is easy to follow.
