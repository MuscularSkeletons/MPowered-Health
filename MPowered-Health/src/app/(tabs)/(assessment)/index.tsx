import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { ASSESSMENT_QUESTIONS } from '@/constants/assessmentQuestions/assessmentQuestions';
import AssessmentScreen from '@/components/assessment/assessmentScreen';
import WeeklyReflectionScreen from '@/constants/assessmentQuestions/WeeklyReflection';
import { palette } from '@/constants/profile/ui';
import { AuthHeader } from '@/components/auth/auth-ui';
import { useAuth } from '@/context/authcontext';
import {
  getCurrentWeeklyAssessmentState,
  getWeeklyAssessmentStreak,
  getWeeklyReflection,
} from '@/hooks/useAssessments';

const ASSESSMENTS = [
  { id: 'My Pain', title: 'My Pain' },
  { id: 'My Movement', title: 'My Movement' },
  { id: 'My Personal Care', title: 'My Personal Care' },
  { id: 'My Social Health', title: 'My Social Health' },
  { id: 'My Management', title: 'My Management' },
] as const;

type AssessmentId = (typeof ASSESSMENTS)[number]['id'];

function BrandWord() {
  return (
    <View style={styles.brandWord}>
      <Text style={styles.brandM}>M</Text>
      <Text style={styles.brandPowered}>Powered</Text>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const name = user?.name?.trim() || 'there';
  const [activeCategoryId, setActiveCategoryId] = useState<AssessmentId | null>(null);
  const [completedList, setCompletedList] = useState<AssessmentId[]>([]);
  const [streak, setStreak] = useState(0);

  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [weeklyReflection, setWeeklyReflection] = useState('');
  

  const [savedAnswersByCat, setSavedAnswersByCat] = useState<
    Partial<Record<AssessmentId, Record<string, any>>>
  >({});

  const refreshStreak = useCallback(async () => {
    try {
      setStreak(await getWeeklyAssessmentStreak());
    } catch {
      setStreak(0);
    }
  }, []);

  const refreshWeeklyProgress = useCallback(async () => {
    try {
      const [weeklyState, reflectionText] = await Promise.all([
      getCurrentWeeklyAssessmentState(),
      getWeeklyReflection(),
      ]);

      setCompletedList(
        weeklyState.completedCategories.filter((title): title is AssessmentId =>
          ASSESSMENTS.some((assessment) => assessment.id === title),
        ),
      );
      setSavedAnswersByCat(weeklyState.answersByCategory);
      setWeeklyReflection(reflectionText);
    } catch {
      // Keep any in-session progress visible if the network is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    void Promise.resolve().then(() =>
      Promise.all([refreshStreak(), refreshWeeklyProgress()]),
    );
  }, [refreshStreak, refreshWeeklyProgress, user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setActiveCategoryId(null);
      setIsEditingReflection(false);
      void refreshWeeklyProgress();
      void refreshStreak();
    });

    return unsubscribe;
  }, [navigation, refreshStreak, refreshWeeklyProgress]);

  // If a category is selected, render the active questionnaire flow
  if (activeCategoryId) {
    const categoryData = ASSESSMENT_QUESTIONS[activeCategoryId];
    const isAlreadyDone = completedList.includes(activeCategoryId);

  return (
    <AssessmentScreen
      categoryData={categoryData}
      initialCompleted={isAlreadyDone}
      existingAnswers={savedAnswersByCat[activeCategoryId] || {}}
      onComplete={(newAnswers) => {
        // 1. Mark as completed
        setCompletedList((prev) =>
          prev.includes(activeCategoryId) ? prev : [...prev, activeCategoryId],
        );
        // 2. Persist the answers for the summary review
        setSavedAnswersByCat((prev) => ({
          ...prev,
          [activeCategoryId]: newAnswers,
        }));
        void refreshStreak();
      }}
      onBack={() => setActiveCategoryId(null)}
    />
  );
}
  // Weekly refelction
  if (isEditingReflection) {
      return (
        <WeeklyReflectionScreen
          initialText={weeklyReflection}
          onBack={() => setIsEditingReflection(false)}
          onSaved={(text) => {
            setWeeklyReflection(text);
          }}
        />
      );
    }


  // Otherwise, render the Overview UI
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AuthHeader />
      
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}

        >
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.greeting}>Good morning, {name} ☀️</Text>
          <View style={styles.bannerTitleRow}>
            <Text style={styles.bannerTitle}>Let&apos;s build your</Text>
            <BrandWord />
            <Text style={styles.bannerTitle}>plan.</Text>
          </View>
          <Text style={styles.bannerCopy}>
            Assess your pain intensity and its impacts weekly to create an empowered plan.
          </Text>

          {/* Streak Card */}
          <View style={styles.streak}>
            <View style={styles.streakIcon}>
              <Text style={styles.streakSpark}>✦</Text>
            </View>
            <View>
              <Text style={styles.streakValue}>
                {streak === 0 ? 'No streak yet' : `${streak} ${streak === 1 ? 'week' : 'weeks'}`}
              </Text>
              <Text style={styles.streakLabel}>
                {streak === 0 ? 'Complete an assessment to begin' : 'Current assessment streak'}
              </Text>
            </View>
            <Text style={styles.streakEncouragement}>
              {streak === 0 ? 'Start today' : 'Keep it going'}
            </Text>
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
          <Text style={styles.sectionTitle}>This week&apos;s assessment</Text>
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
        
        {/* Weekly Reflection Card */}
        <Pressable
          onPress={() => setIsEditingReflection(true)}
          style={({ pressed }) => [
            styles.reflectionCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.reflectionHeader}>
            <View style={styles.reflectionTitleContainer}>
              <Text style={styles.reflectionTitle}>Weekly Reflection</Text>
              <Text style={styles.reflectionSubtitle}>
                {weeklyReflection
                  ? 'Tap to review or edit your notes'
                  : 'Add notes on triggers, wins, or thoughts'}
              </Text>
            </View>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
          </View>

          {weeklyReflection ? (
            <View style={styles.reflectionPreviewBox}>
              <Text style={styles.reflectionPreviewText} numberOfLines={2}>
                &ldquo;{weeklyReflection}&rdquo;
              </Text>
            </View>
          ) : null}

          <View style={styles.recordRow}>
            <Text style={styles.recordText}>
              {weeklyReflection ? 'Edit reflection' : 'Write reflection'}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </Pressable>
        <Text style={styles.sponsor}>Supported by ABBVIE</Text>
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
    paddingBottom: 112,
  },
  banner: { backgroundColor: 'transparent', paddingVertical: 4 },
  greeting: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: palette.text },
  bannerTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.35,
    color: palette.text,
    marginTop: 0,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  brandWord: { width: 69, height: 27, position: 'relative' },
  brandM: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '800',
    color: palette.text,
  },
  brandPowered: {
    position: 'absolute',
    left: 20,
    top: 0,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    color: palette.text,
  },
  bannerCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    marginTop: 8,
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
  streakSpark: { fontSize: 19, color: palette.success },
  streakValue: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: palette.text },
  streakLabel: { marginTop: 1, fontSize: 10, lineHeight: 14, color: palette.muted },
  streakEncouragement: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    color: palette.success,
  },
  progressBlock: { marginTop: 24, marginBottom: 28 },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.line,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
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
    marginTop: 9,
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
    marginLeft: 2,
  },
  assessment: {
    height: 72,
    borderRadius: 16,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 18,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.accent,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  assessmentCopy: {
    position: 'absolute',
    left: 18,
    right: 132,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  assessmentTitle: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: palette.text },
  updated: { fontSize: 11, lineHeight: 15, color: palette.muted, marginTop: 2 },
  record: {
    position: 'absolute',
    right: 18,
    top: 17,
    height: 38,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.primary,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordText: { fontSize: 12, fontWeight: '700', color: palette.text },
  arrow: { fontSize: 18, lineHeight: 18, color: palette.text },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  /* Reflection Button Card */
  reflectionPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reflectionPreviewText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontStyle: 'italic',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  reflectionCard: {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: 20,
  marginTop: 18,
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
  gap: 12,
  overflow: 'hidden', 
},
reflectionHeader: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  width: '100%',
},
reflectionTitleContainer: {
  flex: 1, 
  paddingRight: 12,
},
reflectionTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1E293B',
  marginBottom: 2,
},
reflectionSubtitle: {
  fontSize: 13,
  color: '#64748B',
  lineHeight: 18,
},
optionalBadge: {
  backgroundColor: '#F1F5F9',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,
  alignSelf: 'flex-start',
},
optionalText: {
  fontSize: 11,
  fontWeight: '700',
  color: '#64748B',
  textTransform: 'uppercase',
},
});
