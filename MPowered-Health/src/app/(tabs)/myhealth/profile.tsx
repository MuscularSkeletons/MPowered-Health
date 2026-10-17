import { MhaHeader } from '@/components/my-health/app-ui';
import { ProfileExportActions } from '@/components/my-health/profile-export-actions';
import type { PainProfileReport } from '@/components/my-health/profile-report';
import { layout, palette, radius, spacing } from '@/constants/profile/ui';
import { getLatestAssessments } from '@/services/health-records.store';
import type { AssessmentAnswers, AssessmentId } from '@/types/assessment';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories: {
  id: AssessmentId;
  title: string;
  labels: string[];
}[] = [
  {
    id: 'pain',
    title: 'My Pain',
    labels: [
      'Pain location',
      'Pain characteristics',
      'Current pain',
      'Mildest pain',
      'Worst pain',
      'Average pain',
    ],
  },
  {
    id: 'movement',
    title: 'My Movement',
    labels: [
      'Average activity hours',
      'General movement',
      'Walking',
      'Lifting',
      'Sitting',
      'Standing',
      'My reflections',
    ],
  },
  {
    id: 'personal',
    title: 'My Personal Care',
    labels: [
      'General activities',
      'Personal care (washing, dressing, etc.)',
      'Sleeping',
      'My reflections',
    ],
  },
  {
    id: 'social',
    title: 'My Social Health',
    labels: [
      'Social life',
      'Travelling',
      'Mood',
      'Relationships with others',
      'Enjoyment of life',
      'General mood',
      'Mood trigger',
    ],
  },
  {
    id: 'management',
    title: 'My Management',
    labels: ['Medication', 'Exercise', 'Emotion'],
  },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const answerItems = (answers: AssessmentAnswers, labels: string[]): [string, string][] =>
  labels.map((label, index) => [
    label,
    (answers[index] ?? []).filter(Boolean).join(', ') || 'Not recorded',
  ]);

function AnswerRows({ answers, labels }: { answers: AssessmentAnswers; labels: string[] }) {
  const rows = answerItems(answers, labels).filter(([, value]) => value !== 'Not recorded');

  if (!rows.length) return <Text style={styles.empty}>No answers recorded yet.</Text>;

  return rows.map(([label, value]) => (
    <View key={label} style={styles.answerRow}>
      <Text style={styles.answerLabel}>{label}</Text>
      <Text style={styles.answerValue}>{value}</Text>
    </View>
  ));
}

/** Shows the newest recorded answers across all five assessment categories. */
export default function LatestAssessmentScreen() {
  const [latest, setLatest] = useState(getLatestAssessments());

  useFocusEffect(
    useCallback(() => {
      setLatest(getLatestAssessments());
    }, []),
  );

  const dates = Object.values(latest)
    .map((assessment) => assessment?.completedAt)
    .filter((value): value is string => Boolean(value));
  const updatedAt = dates.sort().at(-1);
  const updatedLabel = updatedAt ? formatDate(updatedAt) : '';
  const report: PainProfileReport = {
    updatedAt: updatedLabel,
    sections: categories.map((category) => ({
      title: category.title,
      items: latest[category.id]
        ? answerItems(latest[category.id]!.answers, category.labels)
        : category.labels.map((label): [string, string] => [label, 'Not recorded']),
    })),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>LATEST ASSESSMENT</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My health profile</Text>
          <ProfileExportActions report={report} disabled={!updatedAt} />
        </View>
        <Text style={styles.intro}>Your newest answers across all five assessment categories.</Text>
        <Text style={styles.updated}>
          {updatedAt ? `Updated ${updatedLabel}` : 'No completed assessments yet'}
        </Text>

        {categories.map((category) => {
          const assessment = latest[category.id];
          return (
            <View key={category.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{category.title}</Text>
                {assessment ? (
                  <Text style={styles.cardDate}>{formatDate(assessment.completedAt)}</Text>
                ) : null}
              </View>
              <View style={styles.rule} />
              {assessment ? (
                <AnswerRows answers={assessment.answers} labels={category.labels} />
              ) : (
                <Text style={styles.empty}>No assessment recorded yet.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.screenGutter,
    paddingTop: spacing.sm,
    paddingBottom: layout.screenBottom,
  },
  back: { color: palette.primary, fontSize: 14, fontWeight: '700', paddingVertical: spacing.md },
  eyebrow: {
    marginTop: spacing.sm,
    color: palette.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  titleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flexShrink: 1, color: palette.text, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  intro: { marginTop: spacing.sm, color: palette.muted, fontSize: 15, lineHeight: 22 },
  updated: { marginTop: spacing.sm, marginBottom: spacing.xl, color: palette.muted, fontSize: 12 },
  card: {
    marginBottom: spacing.lg,
    padding: layout.cardPadding,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.light,
    backgroundColor: palette.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: { flex: 1, color: palette.text, fontSize: 19, lineHeight: 25, fontWeight: '800' },
  cardDate: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  rule: { height: 1, marginVertical: spacing.md, backgroundColor: palette.light },
  answerRow: { marginBottom: spacing.md },
  answerLabel: { color: palette.muted, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  answerValue: { marginTop: 2, color: palette.text, fontSize: 14, lineHeight: 21 },
  empty: { color: palette.muted, fontSize: 13, lineHeight: 20 },
});
