import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../../constants/colours';
import { submitAssessmentAnswers } from './backend/assessmentDb';

interface Question {
  id: string;
  title: string;
  prompt: string;
  kind: 'single' | 'multi' | 'score' | 'text' | string;
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

export default function AssessmentScreen({
  categoryData,
  onBack,
  assessmentId,
  initialCompleted = false,
  onComplete,
}: AssessmentScreenProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(initialCompleted);
  const [calculatedSummary, setCalculatedSummary] = useState<string | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const questions = categoryData?.questions || [];
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelectSingle = (opt: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
  };

  // Function to restart / edit responses
  const handleRedoAssessment = () => {
    setCurrentIndex(0);
    setIsFinished(false);
  };

  const handleToggleMulti = (opt: string) => {
    const list: string[] = answers[currentQ.id] || [];
    const updated = list.includes(opt)
      ? list.filter((i) => i !== opt)
      : [...list, opt];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: updated }));
  };

  const handleSetScore = (val: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: text }));
  };

  const handleNext = () => {
    const val = answers[currentQ.id];

    if (!currentQ.optional) {
      if (currentQ.kind === 'score' && val === undefined) {
        setAnswers((prev) => ({ ...prev, [currentQ.id]: 0 }));
      } else if (currentQ.kind === 'multi' && (!val || val.length === 0)) {
        Alert.alert('Required', 'Please select at least one option.');
        return;
      } else if (currentQ.kind === 'single' && !val) {
        Alert.alert('Required', 'Please select an option to continue.');
        return;
      }
    }

    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let extraFields = {};
      if (typeof categoryData.calculateScore === 'function') {
        const result = categoryData.calculateScore(answers);
        extraFields = result?.extraFields || {};
        if (result?.summaryMessage) {
          setSummaryMessage(result.summaryMessage);
        }
      }

      await submitAssessmentAnswers(
        categoryData.title,
        answers,
        extraFields,
        assessmentId
      );

      // Notify parent of the completed answers
      if (onComplete) {
        onComplete(answers);
      }

      setIsFinished(true);
    } catch (err: any) {
      console.error('Submit error:', err);
      Alert.alert('Error', err.message || 'Failed to submit responses.');
    } finally {
      setIsSubmitting(false);
    }
  };


// -------------------------------------------------------------
// VIEW: Summary Screen
// -------------------------------------------------------------
  if (isFinished) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.categoryTitle}>{categoryData.title}</Text>
        <Text style={styles.summaryBadge}>Submission Complete</Text>
        <Text style={styles.summarySubtitle}>
          Here is a summary of the responses recorded:
        </Text>

        {summaryMessage ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackBody}>{summaryMessage}</Text>
          </View>
        ) : null}

        <View style={styles.summaryList}>
          {categoryData.questions.map((q: Question, idx: number) => {
            const val = answers[q.id];
            let displayVal = 'No response';

            if (Array.isArray(val) && val.length > 0) {
              displayVal = val.join(', ');
            } else if (val !== undefined && val !== '') {
              displayVal = String(val);
            }

            return (
              <View key={q.id} style={styles.summaryCard}>
                <Text style={styles.summaryQuestionNumber}>Question {idx + 1}</Text>
                <Text style={styles.summaryQuestionPrompt}>{q.prompt}</Text>
                <Text style={styles.summaryAnswerText}>
                  <Text style={styles.summaryAnswerLabel}>Your Answer: </Text>
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Button 1: Return to Overview */}
      <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
        <Text style={styles.primaryBtnText}>Return to Main Menu</Text>
      </TouchableOpacity>

      {/* Button 2: Redo / Change answers */}
      <TouchableOpacity style={styles.redoBtn} onPress={handleRedoAssessment}>
        <Text style={styles.redoBtnText}>Change Answers / Retake</Text>
      </TouchableOpacity>
    </ScrollView>
    );
  }

  // 2. EMPTY STATE
  if (!questions.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No questions found for this assessment.</Text>
          <Pressable style={styles.secondaryBtn} onPress={onBack}>
            <Text style={styles.secondaryBtnText}>Back to Overview</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const selectedValue = answers[currentQ.id];
  const selectedMulti: string[] = Array.isArray(selectedValue) ? selectedValue : [];
  const currentScore: number = typeof selectedValue === 'number' ? selectedValue : 0;
  const currentText: string = typeof selectedValue === 'string' ? selectedValue : '';

  // 3. QUESTIONS FLOW
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (currentIndex > 0 ? setCurrentIndex((prev) => prev - 1) : onBack())}
          style={styles.backButton}
          hitSlop={12}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <Text style={styles.categoryTitle}>{categoryData.title}</Text>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>{currentQ.title}</Text>
        </View>

        <Text style={styles.prompt}>{currentQ.prompt}</Text>
        {currentQ.helper && <Text style={styles.helperText}>{currentQ.helper}</Text>}

        {/* Single Select */}
        {currentQ.kind === 'single' && (
          <View style={styles.optionsWrap}>
            {currentQ.options?.map((option) => {
              const active = selectedValue === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => handleSelectSingle(option)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    active && styles.optionCardActive,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionCardText,
                      active && styles.optionCardTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  <View
                    style={[
                      styles.radioCircle,
                      active && styles.radioCircleActive,
                    ]}
                  >
                    {active && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Multi Select */}
        {currentQ.kind === 'multi' && (
          <View style={styles.optionsWrap}>
            {currentQ.options?.map((option) => {
              const active = selectedMulti.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => handleToggleMulti(option)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    active && styles.optionCardActive,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionCardText,
                      active && styles.optionCardTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  <View
                    style={[
                      styles.checkCircle,
                      active && styles.checkCircleActive,
                    ]}
                  >
                    {active && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Score Stepper */}
        {currentQ.kind === 'score' && (
          <View style={styles.sliderCard}>
            <View style={styles.scoreBubble}>
              <Text style={styles.scoreValue}>{currentScore}</Text>
              <Text style={styles.scoreScale}>/ 10</Text>
            </View>

            <View style={styles.trackContainer}>
              <View style={styles.trackLine}>
                <View
                  style={[
                    styles.trackLineActive,
                    { width: `${(currentScore / 10) * 100}%` },
                  ]}
                />
              </View>

              <View style={styles.nodesRow}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = currentScore === num;
                  const isPast = currentScore >= num;
                  return (
                    <Pressable
                      key={num}
                      onPress={() => handleSetScore(num)}
                      hitSlop={8}
                      style={[
                        styles.trackNode,
                        isPast && styles.trackNodePast,
                        isSelected && styles.trackNodeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.nodeText,
                          isSelected && styles.nodeTextSelected,
                        ]}
                      >
                        {num}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMin}>0 (None)</Text>
              <Text style={styles.sliderMax}>10 (Severe)</Text>
            </View>
          </View>
        )}

        {/* Free Text */}
        {currentQ.kind === 'text' && (
          <View style={styles.textContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Type your notes or reflections here..."
              placeholderTextColor={palette.muted}
              value={currentText}
              onChangeText={handleTextChange}
            />
          </View>
        )}
      </ScrollView>

      {/* Docked Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.actionBtn, isSubmitting && styles.actionBtnDisabled]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.actionBtnText}>
              {isLast ? 'Complete Assessment' : 'Next Question ›'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surface },
  topBar: {
    height: 54,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 65,
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: palette.text,
    fontWeight: '600',
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  stepBadge: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: palette.line,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
    marginBottom: 20,
  },
  optionsWrap: { gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
  },
  optionCardActive: {
    backgroundColor: palette.selectionBackground,
    borderColor: palette.success,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  optionCardText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.text,
    flex: 1,
    paddingRight: 10,
  },
  optionCardTextActive: {
    color: palette.text,
    fontWeight: '700',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  checkCircleActive: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  radioCircleActive: {
    borderColor: palette.success,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.success,
  },
  sliderCard: {
    backgroundColor: palette.surface,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    marginTop: 10,
  },
  scoreBubble: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 30,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: palette.primary,
  },
  scoreScale: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.muted,
    marginLeft: 4,
  },
  trackContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 10,
  },
  trackLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 6,
    backgroundColor: palette.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackLineActive: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  trackNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackNodePast: {
    borderColor: palette.primary,
    backgroundColor: palette.accentSoft,
  },
  trackNodeSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    transform: [{ scale: 1.2 }],
  },
  nodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.muted,
  },
  nodeTextSelected: {
    color: '#ffffff',
  },
  sliderLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sliderMin: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  sliderMax: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  textContainer: { marginTop: 10 },
  textInput: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: palette.line,
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.surface,
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: palette.muted,
    marginBottom: 16,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: palette.light,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },

   summaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  feedbackCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  feedbackBody: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  summaryList: {
    gap: 12,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
  },
  summaryQuestionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryQuestionPrompt: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 6,
  },
  summaryAnswerText: {
    fontSize: 14,
    color: '#2563eb',
  },
  summaryAnswerLabel: {
    color: '#475569',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  redoBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    minWidth: 200,
    marginTop: 6,
    marginBottom: 20,
  },
  redoBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});