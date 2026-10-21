import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, PrimaryButton } from '@/components/shared/common';
import { palette } from '@/constants/ui/styling';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { usePrescriptions } from '@/context/prescriptionsContext';
import { prescriptionLabel } from '@/services/prescriptionHelper';

interface Question {
  id: string;
  title: string;
  prompt: string;
  kind: 'single' | 'multi' | 'score' | 'number' | 'text' | string;
  options?: string[];
  helper?: string;
  optional?: boolean;
}

interface AssessmentScreenProps {
  categoryData: {
    title: string;
    tip?: string;
    summary?: string;
    questions: Question[];
    calculateScore?: (answers: Record<string, any>) => any;
  };
  onBack: () => void;
  assessmentId?: string | null;
  initialCompleted?: boolean;
  existingAnswers?: Record<string, any>;
  onComplete?: (answers: Record<string, any>) => void;
}

const asSentence = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const painLabel = (score: number) =>
  score === 0
    ? 'I have no pain at all'
    : score <= 3
      ? 'The pain is very mild'
      : score <= 6
        ? 'The pain is moderate'
        : score <= 8
          ? 'The pain is fairly severe'
          : score === 9
            ? 'The pain is extremely severe'
            : 'The pain is the worst imaginable';

function ScoreSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const trackRef = useRef<View>(null);
  const metrics = useRef({ left: 0, width: 1, ready: false });
  const lastValue = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    lastValue.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

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

  // PanResponder keeps these callbacks for the full drag; refs are read only during a gesture.
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
    <View style={styles.sliderArea}>
      <View
        ref={trackRef}
        collapsable={false}
        onLayout={() => measureTrack()}
        {...pan.panHandlers}
        style={styles.sliderTrack}
      >
        <View pointerEvents="none" style={[styles.sliderFill, { width: `${value * 10}%` }]} />
        <View pointerEvents="none" style={[styles.sliderThumb, { left: `${value * 10}%` }]}>
          <View style={styles.sliderBubble}>
            <Text style={styles.sliderBubbleText}>{value}</Text>
          </View>
        </View>
      </View>
      <View style={styles.sliderEnds}>
        <Text style={styles.sliderEnd}>0</Text>
        <Text style={styles.sliderEnd}>10</Text>
      </View>
    </View>
  );
}

function currentPeriod() {
  const start = new Date();
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString('en-AU', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-AU', { month: 'short' });
  const range =
    startMonth === endMonth
      ? `${start.getDate()}–${end.getDate()} ${endMonth}`
      : `${start.getDate()} ${startMonth}–${end.getDate()} ${endMonth}`;

  return `Period: ${range}`;
}

export default function AssessmentScreen({
  categoryData,
  onBack,
  assessmentId,
  initialCompleted = false,
  existingAnswers = {},
  onComplete,
}: AssessmentScreenProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(existingAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(initialCompleted);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(existingAnswers?.impact_level || null,);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');

  const { list, loadFailed } = usePrescriptions();

  const scrollRef = useRef<ScrollView>(null);

  const questions = (categoryData?.questions || []).map((question) => {
    if (question.id === 'medication') {
      return {
        ...question,
        options: list.map((medication) => prescriptionLabel(medication))
      };
    } else {
      return question;
    }
  });

  const currentQ = questions[currentIndex];
  const selectedValue = currentQ ? answers[currentQ.id] : undefined;
  const selectedMulti: string[] = Array.isArray(selectedValue) ? selectedValue : [];
  const currentScore = typeof selectedValue === 'number' ? selectedValue : 0;
  const currentText = typeof selectedValue === 'string' ? selectedValue : '';
  const isLast = currentIndex === questions.length - 1;

  const isLocationQuestion = currentQ?.id === 'pain_location';
  const hasSelectedOther = isLocationQuestion && selectedMulti.includes('Other');

  const valid = Boolean(
    currentQ?.optional ||
      selectedValue === 0 ||
      (Array.isArray(selectedValue)
        ? selectedValue.length && (!hasSelectedOther || otherText.trim().length > 0)
        : String(selectedValue ?? '').trim()),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const select = (value: string | number) => {
    if (currentQ.kind === 'multi') {
      const stringVal = String(value);
      const isRemoving = selectedMulti.includes(stringVal);
      const next = isRemoving
        ? selectedMulti.filter((item) => item !== stringVal)
        : [...selectedMulti, stringVal];

      if (stringVal === 'Other' && isRemoving) {
        setOtherText('');
      }

      setAnswers((previous) => ({ ...previous, [currentQ.id]: next }));
      return;
    }
    setAnswers((previous) => ({ ...previous, [currentQ.id]: value }));
  };

  const handleSubmit = async (finalAnswers: Record<string, any>) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const calculated = categoryData.calculateScore?.(finalAnswers);
      const insightText = calculated?.summaryMessage || calculated?.extraFields?.impact_level || null;
      setSummaryMessage(insightText);
      await submitAssessmentAnswers(
        categoryData.title,
        finalAnswers,
        calculated?.extraFields || {},
        assessmentId,
      );
      const persistedAnswers = {
        ...finalAnswers,
        ...(calculated?.extraFields || {}),
      };
      onComplete?.(persistedAnswers);
      setIsFinished(true);
    } catch (error: any) {
      const message = error?.message || 'Failed to save responses. Please try again.';
      setSubmitError(message);
      Alert.alert('Could not save answers', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (!valid) return;

    let updatedAnswers = { ...answers };

    if (isLocationQuestion && hasSelectedOther) {
      const trimmed = otherText.trim();
      const existingOptions = (currentQ.options || []).filter(
        (opt) => opt.toLowerCase() !== 'other',
      );

      const isDuplicate = existingOptions.some(
        (opt) => opt.toLowerCase() === trimmed.toLowerCase(),
      );

      if (isDuplicate) {
        Alert.alert(
          'Location Already Listed',
          `"${trimmed}" is already an option in the list. Please select it from the options above.`,
        );
        return;
      }

      const finalLocations = selectedMulti
        .filter((loc) => loc !== 'Other')
        .concat(asSentence(trimmed));

      updatedAnswers = {
        ...answers,
        [currentQ.id]: finalLocations,
      };
      setAnswers(updatedAnswers);
    }

    if (isLast) handleSubmit(updatedAnswers);
    else setCurrentIndex((index) => index + 1);
  };

  

  
  if (!questions.length) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.empty}>
          <Text style={styles.required}>No questions found for this assessment.</Text>
          <PrimaryButton label="Back to Overview" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    const calculated = categoryData.calculateScore?.(answers);
    const insight =
      summaryMessage ||
      calculated?.summaryMessage ||
      existingAnswers?.impact_level ||
      answers?.impact_level ||
      null;
    const grouped = questions.reduce<Record<string, Question[]>>((result, question) => {
      (result[question.title] ||= []).push(question);
      return result;
    }, {});
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <ScrollView style={styles.body} contentContainerStyle={styles.summary}>
          <Text style={styles.summaryTitle}>{categoryData.title} Summary</Text>
          <Text style={styles.summaryCopy}>
            {categoryData.summary || 'This helps guide your treatment and support your recovery.'}
          </Text>
          <View style={styles.resultCard}>
            <View style={styles.summaryMeta}>
              <Text style={styles.resultHeading}>{categoryData.title}</Text>
              <Text style={styles.period}>{currentPeriod()}</Text>
            </View>
            {insight ? (
              <View style={styles.summaryInsight}>
                <View style={styles.summaryStatement}>
                  <Text style={styles.summaryStatementText}>{insight}</Text>
                </View>
              </View>
            ) : null}
            {Object.entries(grouped).map(([title, group], index) => (
              <View key={title} style={[styles.resultSection, index > 0 && styles.resultSectionBorder]}>
                <Text style={styles.resultSectionTitle}>{title}</Text>
                {group.map((question) => {
                  const answer = answers[question.id];
                  const text = Array.isArray(answer)
                    ? answer.map(asSentence).join('\n')
                    : answer === undefined || answer === ''
                      ? 'No response'
                      : asSentence(String(answer));
                  return (
                    <View key={question.id} style={styles.resultItem}>
                      <Text style={styles.resultLabel}>{question.prompt}</Text>
                      <Text style={styles.result}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.saved}>Your answers have been saved.</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setCurrentIndex(0);
                setIsFinished(false);
              }}
            >
              <Text style={styles.closeText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onBack}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.top}>
            <Pressable onPress={() => (currentIndex ? setCurrentIndex((index) => index - 1) : onBack())}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
            <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.module}>{categoryData.title}</Text>
          <Text style={styles.title}>{currentQ.title}</Text>
          <Text style={styles.prompt}>{currentQ.prompt}</Text>

          {/* display messages related to status of prescriptions */}   
          <View>
            {
              currentQ.id === 'medication' && loadFailed ? (
                <Text style={styles.copy}>Your prescriptions could not be loaded.</Text>
              ) : currentQ.id === 'medication' && list.length === 0 ? (
                <Text style={styles.copy}>No prescriptions added yet.</Text>
              ) : null
            }
          </View>

          {currentQ.kind === 'score' ? (
            <>
              <View style={styles.score}>
                <Text style={styles.scoreNumber}>
                  {selectedValue === undefined ? '0 to 10' : currentScore}
                </Text>
                <Text style={styles.scoreLabel}>
                  {selectedValue === undefined ? 'Slide to select a value' : painLabel(currentScore)}
                </Text>
              </View>
              <ScoreSlider value={currentScore} onChange={select} />
            </>
          ) : currentQ.kind === 'text' || currentQ.kind === 'number' ? (
            <TextInput
              value={currentText}
              onChangeText={(text) => select(currentQ.kind === 'number' ? text.replace(/\D/g, '') : text)}
              keyboardType={currentQ.kind === 'number' ? 'numeric' : 'default'}
              maxLength={currentQ.kind === 'number' ? 2 : 500}
              multiline={currentQ.kind === 'text'}
              placeholder={currentQ.kind === 'number' ? 'Input number only' : 'Write your reflection'}
              placeholderTextColor={palette.muted}
              style={[styles.input, currentQ.kind === 'text' && styles.textArea]}
            />
          ) : ( 
            <View style={styles.options}>
              {currentQ.options?.map((option) => {
                const on = currentQ.kind === 'multi'
                  ? selectedMulti.includes(option)
                  : selectedValue === option;
                return (
                  <View key={option}>
                  <Pressable
                    
                    onPress={() => select(option)}
                    style={[styles.option, on && styles.optionOn]}
                  >
                    <Text style={[styles.optionText, on && styles.optionTextOn]}>{asSentence(option)}</Text>
                    <View
                      style={[
                        currentQ.kind === 'single' ? styles.radio : styles.box,
                        on && styles.markOn,
                      ]}
                    >
                      <Text style={styles.tick}>{on ? '✓' : ''}</Text>
                    </View>
                  </Pressable>

                  {/* pop-up textinput when "Other" is selected */}
                    {isLocationQuestion && option === 'Other' && on ? (
                      <View style={styles.otherInputContainer}>
                        <TextInput
                          value={otherText}
                          onChangeText={setOtherText}
                          placeholder="Please specify location (e.g., Wrist, Elbow)"
                          placeholderTextColor="#81798A"
                          style={styles.otherTextInput}
                          autoFocus
                          maxLength={50}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.action}>
            <PrimaryButton
              label={isSubmitting ? 'Saving…' : isLast ? 'Review' : 'Record'}
              disabled={!valid || isSubmitting}
              loading={isSubmitting}
              onPress={next}
            />
            {!valid ? <Text style={styles.required}>This question is mandatory.</Text> : null}
            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          </View>
          {currentQ.helper ? <Text style={styles.helper}>{currentQ.helper}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surface },
  body: { flex: 1, backgroundColor: palette.background },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { fontSize: 14, fontWeight: '700', color: palette.success, paddingVertical: 12 },
  counter: { fontSize: 12, fontWeight: '700', color: palette.muted },
  progressTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: palette.line,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 26,
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: palette.success },
  module: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: palette.text,
    marginTop: 8,
  },
  prompt: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 9 },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.muted,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
    borderRadius: 12,
  },
  options: { gap: 12, marginTop: 24 },
  option: {
    minHeight: 64,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionOn: { backgroundColor: palette.secondary, borderColor: palette.success },
  optionText: { flex: 1, fontSize: 14, lineHeight: 20, color: palette.text, paddingRight: 10 },
  optionTextOn: { fontWeight: '700' },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: palette.controlBorder,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: palette.controlBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: palette.success, borderColor: palette.success },
  tick: { color: '#fff', fontSize: 13, fontWeight: '800' },
  score: {
    backgroundColor: palette.accentSoft,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 26,
  },
  scoreNumber: { fontSize: 38, fontWeight: '800', color: palette.success },
  scoreLabel: { fontSize: 13, color: palette.muted, marginTop: 7 },
  sliderArea: { marginTop: 28, marginBottom: 12 },
  sliderTrack: {
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.accent,
  },
  sliderThumb: {
    position: 'absolute',
    marginLeft: -10,
    width: 20,
    height: 42,
    borderRadius: 6,
    backgroundColor: palette.accent,
    alignItems: 'center',
  },
  sliderBubble: {
    position: 'absolute',
    top: -40,
    minWidth: 42,
    height: 34,
    borderRadius: 7,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBubbleText: { fontSize: 16, fontWeight: '800', color: palette.text },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  sliderEnd: { fontSize: 11, fontWeight: '700', color: palette.muted },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 16,
    fontSize: 15,
    color: palette.text,
    textAlignVertical: 'top',
    marginTop: 24,
  },
  textArea: { minHeight: 150 },
  action: { marginTop: 28 },
  required: { fontSize: 12, fontWeight: '400', color: palette.text, textAlign: 'center', marginTop: 10 },
  submitError: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: palette.error,
    textAlign: 'center',
  },
  empty: { flex: 1, justifyContent: 'center', padding: 24, gap: 18 },
  summary: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 110,
  },
  summaryTitle: { fontSize: 30, fontWeight: '800', color: palette.text },
  summaryCopy: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 8 },
  resultCard: { backgroundColor: palette.surface, borderRadius: 22, padding: 20, marginVertical: 24 },
  summaryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  resultHeading: { fontSize: 16, lineHeight: 20, fontWeight: '800', color: palette.text },
  period: { fontSize: 12, lineHeight: 20, fontWeight: '700', color: palette.primary },
  summaryInsight: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.accent,
    overflow: 'hidden',
  },
  summaryStatement: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  summaryStatementText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
  },
  guideButton: {
    minHeight: 54,
    backgroundColor: palette.accentSoft,
    borderTopWidth: 1,
    borderTopColor: palette.accent,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  guideIcon: { fontSize: 19, fontWeight: '800', color: palette.text },
  guideText: { fontSize: 13, fontWeight: '800', color: palette.text },
  guideArrow: { fontSize: 22, color: palette.text },
  resultSection: { paddingVertical: 10 },
  resultSectionBorder: { borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 18 },
  resultSectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: palette.primary,
    marginBottom: 10,
  },
  resultItem: { marginBottom: 10 },
  resultLabel: { fontSize: 13, lineHeight: 19, fontWeight: '700', color: palette.text },
  result: { fontSize: 13, lineHeight: 20, color: palette.text, marginTop: 3 },
  summaryFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  saved: { fontSize: 12, fontWeight: '700', color: palette.success, flex: 1 },
  closeButton: {
    minWidth: 96,
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  closeText: { fontSize: 13, fontWeight: '800', color: palette.text },

  otherInputContainer: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  otherTextInput: {
    borderWidth: 1.5,
    borderColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.text,
    backgroundColor: '#ffffff',
  },
  copy: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
    marginTop: 40,
    fontStyle: 'italic',
  },
});
