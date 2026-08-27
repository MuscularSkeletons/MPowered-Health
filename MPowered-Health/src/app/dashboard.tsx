import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, palette } from '@/components/mha-ui';
import { productContent } from '@/constants/product-content';
import { getCompletedAssessments, getWeeklyStreak } from '@/constants/assessment-session';
function Assessment({
  title,
  type,
  completed,
  name,
}: {
  title: string;
  type: string;
  completed: string;
  name: string;
}) {
  const isDone = completed.split(',').includes(type);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/assessment',
          params: {
            type,
            completed,
            name,
          },
        })
      }
      style={({ pressed }) => [s.assessment, pressed && s.pressed]}
    >
      <View style={s.assessmentCopy}>
        <Text style={s.assessmentTitle}>{title}</Text>
        {isDone ? <Text style={s.updated}>Updated this week</Text> : null}
      </View>
      <View style={s.record}>
        <Text style={s.recordText}>{isDone ? 'View summary' : 'Record'}</Text>
        <Text style={s.arrow}>›</Text>
      </View>
    </Pressable>
  );
}
function BrandWord() {
  return (
    <View style={s.brandWord}>
      <Text style={s.brandM}>M</Text>
      <Text style={s.brandPowered}>Powered</Text>
    </View>
  );
}
export default function Home() {
  const { completed = '', name = 'Jane' } = useLocalSearchParams<{
    completed?: string;
    name?: string;
  }>();
  const [sessionCompleted, setSessionCompleted] = useState(getCompletedAssessments());
  useFocusEffect(
    useCallback(() => {
      setSessionCompleted(getCompletedAssessments());
    }, []),
  );
  const done = [...new Set([...completed.split(',').filter(Boolean), ...sessionCompleted])];
  const completedValue = done.join(',');
  const streak = getWeeklyStreak();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          <Text style={s.greeting}>Good morning, {name} ☀️</Text>
          <View style={s.bannerTitleRow}>
            <Text style={s.bannerTitle}>Let&apos;s build your</Text>
            <BrandWord />
            <Text style={s.bannerTitle}>plan.</Text>
          </View>
          <Text style={s.bannerCopy}>{productContent.dashboard.description}</Text>
          <View style={s.streak}>
            <View style={s.streakIcon}>
              <Text style={s.streakSpark}>✦</Text>
            </View>
            <View>
              <Text style={s.streakValue}>{streak}-week streak</Text>
              <Text style={s.streakLabel}>Weekly check-ins completed</Text>
            </View>
            <Text style={s.streakEncouragement}>Keep it going</Text>
          </View>
        </View>
        <View style={s.progressBlock}>
          <View style={s.track}>
            <View style={[s.trackFill, { width: `${done.length * 20}%` }]} />
          </View>
          <View style={s.progressHead}>
            <Text style={s.progressLabel}>
              {done.length === 5 ? '✨ You completed all tasks' : "This week's progress"}
            </Text>
            <Text style={s.progressCount}>{done.length}/5 assessments</Text>
          </View>
        </View>
        <View style={s.panel}>
          <Text style={s.sectionTitle}>{productContent.dashboard.assessmentTitle}</Text>
          <Assessment title="My Pain" type="pain" completed={completedValue} name={name} />
          <Assessment title="My Movement" type="movement" completed={completedValue} name={name} />
          <Assessment
            title="My Personal Care"
            type="personal"
            completed={completedValue}
            name={name}
          />
          <Assessment
            title="My Social Health"
            type="social"
            completed={completedValue}
            name={name}
          />
          <Assessment
            title="My Management"
            type="management"
            completed={completedValue}
            name={name}
          />
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/workflow',
              params: {
                flow: 'reflection',
              },
            })
          }
          style={({ pressed }) => [s.reflection, pressed && s.pressed]}
        >
          <Text style={s.plus}>＋</Text>
          <Text style={s.reflectionText}>Add a reflection for this week</Text>
        </Pressable>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 112,
  },
  banner: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  greeting: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.text,
  },
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
  streak: {
    minHeight: 58,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D8C7FA',
    borderRadius: 16,
    backgroundColor: '#F6F2FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D8C7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakSpark: {
    fontSize: 19,
    color: palette.primary,
  },
  streakValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: palette.text,
  },
  streakLabel: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
  },
  streakEncouragement: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    color: palette.primary,
  },
  bannerCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    marginTop: 8,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  progressBlock: { marginTop: 24, marginBottom: 28 },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.text,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8E4ED',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: palette.secondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  panel: {
    backgroundColor: '#F4F2F7',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  assessment: {
    height: 72,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2F174A',
    borderWidth: 1,
    borderColor: palette.line,
    shadowOpacity: 0.025,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  pressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  assessmentTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.text,
  },
  assessmentCopy: {
    position: 'absolute',
    left: 18,
    right: 132,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  updated: { fontSize: 11, lineHeight: 15, color: palette.muted, marginTop: 2 },
  record: {
    position: 'absolute',
    right: 18,
    top: 17,
    height: 38,
    borderWidth: 1,
    borderColor: '#D8CFE5',
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
  },
  arrow: {
    fontSize: 18,
    lineHeight: 18,
    color: palette.primary,
  },
  reflection: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#F4F2F7',
  },
  plus: {
    fontSize: 22,
    color: palette.primary,
  },
  reflectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 24,
  },
});
