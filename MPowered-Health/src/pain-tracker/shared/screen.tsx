/** Provides the shared questionnaire screen and completed-results view for Pain Tracker. */
import type { AssessmentFlowOptions } from './state/useFlow';
import { useAssessmentFlow } from './state/useFlow';
import { AssessmentSummary, type SummaryPresentation } from './summary/Summary';
import { QuestionInput } from './inputs/QuestionInput';
import { s } from './styles';
import { ActionButton, MhaHeader } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export type AssessmentScreenOptions = AssessmentFlowOptions & { presentation: SummaryPresentation };

/** Displays an assessment entry or its question flow for this part of Pain Tracker. */
export default function AssessmentScreen(props: AssessmentScreenOptions) {
  return <AssessmentContent key={props.assessmentId} {...props} />;
}

/** Displays the current assessment question or the completed results using the flow state. */
function AssessmentContent(props: AssessmentScreenOptions) {
  const { completed = '', name = 'Jane' } = useLocalSearchParams<{
    completed?: string;
    name?: string;
  }>();
  const { definition: spec, presentation } = props;
  const {
    activeStep,
    question: q,
    current,
    answers,
    done,
    saving,
    saveError,
    valid,
    select,
    next,
    back,
    restart,
    summarySections,
  } = useAssessmentFlow(props);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeStep]);

  /** Closes the results view and returns to the previous destination. */
  const closeSummary = () => {
    const all = [...new Set([...completed.split(',').filter(Boolean), props.assessmentId])].join(
      ',',
    );
    router.replace({ pathname: '/dashboard', params: { completed: all, name } });
  };

  if (done)
    return (
      <AssessmentSummary
        definition={spec}
        answers={answers}
        sections={summarySections}
        presentation={presentation}
        onRestart={restart}
        onClose={closeSummary}
      />
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
                  ? back()
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
          <QuestionInput question={q} value={current} onChange={select} />
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
