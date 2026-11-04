import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
} from 'react-native';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { usePrescriptions } from '@/context/prescriptionsContext';
import { prescriptionLabel } from '@/services/prescriptionHelper';
import { QuestionItem } from '@/types/assessment';
import { AssessmentSummary } from '@/components/assessment/assessmentSummary';
import { AssessmentQuestion, EmptyAssessment } from '@/components/assessment/assessementQuestion';
import { asSentence } from "@/utils/convertToSentence";

interface AssessmentScreenProps {
  categoryData: {
    title: string;
    tip?: string;
    summary?: string;
    questions: QuestionItem[];
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
      <EmptyAssessment
        onBack={onBack}
      />
    );
  }

  if (isFinished) {
    return (
      <AssessmentSummary
        categoryData={categoryData}
        answers={answers}
        existingAnswers={existingAnswers}
        questions={questions}
        summaryMessage={summaryMessage}
        onEdit={() => {
          setCurrentIndex(0);
          setIsFinished(false);
        }}
        onBack={onBack}
      />
    );
  }

  return (
    <AssessmentQuestion
      categoryData={categoryData}
      scrollRef={scrollRef}
      questions={questions}
      currentQ={currentQ}
      selectedMulti={selectedMulti}
      selectedValue={selectedValue}
      isLocationQuestion={isLocationQuestion}
      currentScore={currentScore}
      otherText={otherText}
      valid={valid}
      loadFailed={loadFailed}
      submitError={submitError}
      isSubmitting={isSubmitting}
      onBack={onBack}
      select={select}
      setOtherText={setOtherText}
      setCurrentIndex={setCurrentIndex}
      currentIndex={currentIndex}
      list={list}
      currentText={currentText}
      next={next}
      isLast={isLast}
    />
  );
};