/** Displays completed assessment results and available follow-up actions. */
import type {
  AssessmentAnswers,
  AssessmentDefinition,
  SummarySection,
} from '@/shared/health-records/assessment-types';
import type { ReactNode } from 'react';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SummaryInsight } from './Insight';
import { s } from '../styles';
export interface SummaryPresentation {
  intro: string;
  period: () => string;
  savedLabel: string;
  tipUrl?: string;
  repeatable?: boolean;
  renderResults?: (answers: AssessmentAnswers) => ReactNode;
}

/** Displays completed assessment results and available follow-up actions. */
export function AssessmentSummary({
  definition: spec,
  answers,
  sections: summarySections,
  presentation,
  onRestart,
  onClose,
}: {
  definition: AssessmentDefinition;
  answers: AssessmentAnswers;
  sections: SummarySection[];
  presentation: SummaryPresentation;
  onRestart: () => void;
  onClose: () => void;
}) {
  const result = Object.values(answers).flat();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.summary}>
        <Text style={s.summaryTitle}>My Pain Summary</Text>
        <Text style={s.summaryCopy}>{presentation.intro}</Text>
        <View style={s.resultCard}>
          <View style={s.summaryMeta}>
            <Text style={[s.resultHeading, { marginBottom: 0, lineHeight: 20 }]}>{spec.title}</Text>
            <Text style={s.period}>{presentation.period()}</Text>
          </View>
          {presentation.tipUrl ? (
            <SummaryInsight summary={spec.summary} tip={spec.tip} url={presentation.tipUrl} />
          ) : null}
          {presentation.tipUrl ? (
            <Text style={[s.resultHeading, s.headingDivider]}>My results:</Text>
          ) : null}
          {presentation.renderResults
            ? presentation.renderResults(answers)
            : summarySections.map((section, i) => (
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
              ))}
          {!result.length ? <Text style={s.result}>No items recorded this week.</Text> : null}
        </View>
        <View style={s.summaryFooter}>
          <Text style={s.saved}>{presentation.savedLabel}</Text>
          {presentation.repeatable ? (
            <Pressable accessibilityRole="button" style={s.closeButton} onPress={onRestart}>
              <Text style={s.closeText}>Record new assessment</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [s.closeButton, pressed && s.closePressed]}
          >
            <Text style={s.closeText}>Close</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
