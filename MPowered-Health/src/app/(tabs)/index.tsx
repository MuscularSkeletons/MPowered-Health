import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSESSMENT_QUESTIONS } from '../(assessment)/questions/index';
import AssessmentScreen from '../(assessment)/assessmentScreen';
import { palette } from '../../constants/profile/ui';

const ASSESSMENTS = [
  { id: 'My Pain', title: 'My Pain' },
  { id: 'My Movement', title: 'My Movement' },
  { id: 'My Personal Care', title: 'My Personal Care' },
  { id: 'My Social Health', title: 'My Social Health' },
  { id: 'My Management', title: 'My Management' },
] as const;


export default function HomeScreen() {
  const [activeCategoryId, setActiveCategoryId] = useState<any>(null);
  const [completedList, setCompletedList] = useState<any[]>([]);

const [savedAnswersByCat, setSavedAnswersByCat] = useState<Record<string, Record<string, any>>>({});

  const streak = 1;

  // If a category is selected, render the active questionnaire flow
  if (activeCategoryId) {
  const categoryData = (ASSESSMENT_QUESTIONS as any)[activeCategoryId];
  const isAlreadyDone = completedList.includes(activeCategoryId);

  return (
    <AssessmentScreen
      categoryData={categoryData}
      initialCompleted={isAlreadyDone}
      existingAnswers={savedAnswersByCat[activeCategoryId] || {}}
      onComplete={(newAnswers) => {
        // 1. Mark as completed
        if (!completedList.includes(activeCategoryId)) {
          setCompletedList((prev) => [...prev, activeCategoryId]);
        }
        // 2. Persist the answers for the summary review
        setSavedAnswersByCat((prev) => ({
          ...prev,
          [activeCategoryId]: newAnswers,
        }));
      }}
      onBack={() => setActiveCategoryId(null)}
    />
  );
}

  // Otherwise, render the Overview UI
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.greeting}>Good morning ☀️</Text>
          <Text style={styles.bannerTitle}>Let's build your plan.</Text>
          <Text style={styles.bannerCopy}>
            Assess your pain intensity and its impacts weekly to create an empowered plan.
          </Text>

          {/* Streak Card */}
          <View style={styles.streak}>
            <View style={styles.streakIcon}>
              <Text style={styles.streakSpark}>✦</Text>
            </View>
            <View>
              <Text style={styles.streakValue}>{streak}-week streak</Text>
              <Text style={styles.streakLabel}>Weekly check-ins completed</Text>
            </View>
            <Text style={styles.streakEncouragement}>Keep it going</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBlock}>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${(completedList.length / ASSESSMENTS.length) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.progressHead}>
            <Text style={styles.progressLabel}>
              {completedList.length === ASSESSMENTS.length
                ? '✨ You completed all tasks'
                : "This week's progress"}
            </Text>
            <Text style={styles.progressCount}>
              {completedList.length}/{ASSESSMENTS.length} assessments
            </Text>
          </View>
        </View>

        {/* Assessment Card List */}
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>This week's assessment</Text>
          {ASSESSMENTS.map((item) => {
            const isDone = completedList.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => setActiveCategoryId(item.id)}
                style={({ pressed }) => [
                  styles.assessment,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.assessmentCopy}>
                  <Text style={styles.assessmentTitle}>{item.title}</Text>
                  {isDone && (
                    <Text style={styles.updated}>Updated this week</Text>
                  )}
                </View>

                <View style={styles.record}>
                  <Text style={styles.recordText}>
                    {isDone ? 'View summary' : 'Record'}
                  </Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
    paddingTop: 24,
    paddingBottom: 60,
  },
  banner: { paddingVertical: 4 },
  greeting: { fontSize: 14, fontWeight: '600', color: palette.text },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
    marginTop: 6,
  },
  bannerCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    marginTop: 6,
  },
  streak: {
    minHeight: 58,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: palette.light,
    borderRadius: 16,
    backgroundColor: palette.selectionBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakSpark: { fontSize: 18, color: palette.success },
  streakValue: { fontSize: 14, fontWeight: '800', color: palette.text },
  streakLabel: { fontSize: 10, color: palette.muted },
  streakEncouragement: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    color: palette.success,
  },
  progressBlock: { marginTop: 24, marginBottom: 24 },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.line,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: palette.success,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: { fontSize: 12, fontWeight: '600', color: palette.text },
  progressCount: { fontSize: 12, fontWeight: '600', color: palette.muted },
  panel: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 6,
  },
  assessment: {
    height: 72,
    borderRadius: 16,
    backgroundColor: palette.background,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.accent,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  assessmentCopy: { flex: 1 },
  assessmentTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
  updated: { fontSize: 11, color: palette.muted, marginTop: 2 },
  record: {
    height: 38,
    backgroundColor: palette.primary,
    borderRadius: 17,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  arrow: { fontSize: 16, color: '#ffffff' },
  
});