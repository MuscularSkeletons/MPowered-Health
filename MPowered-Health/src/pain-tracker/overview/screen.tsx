/** Shows the assessment choices, completion information, and reflection entry point. */
import { assessmentRoutes } from '@/pain-tracker/routes';
import type { AssessmentId } from '@/shared/health-records/assessment-types';
import { s } from './styles';
// This screen is the app home page and shows weekly assessment progress.
import { getProfile } from '@/shared/account/repository';
import { getCompletedAssessments, getWeeklyStreak } from '@/shared/health-records/session';
import { getReflection } from '@/pain-tracker/reflection/repository';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// One row decides whether to offer Record or View summary.
/** Displays an assessment entry or its question flow for this part of Pain Tracker. */
function Assessment({
  title,
  type,
  completed,
  name,
}: {
  title: string;
  type: AssessmentId;
  completed: string;
  name: string;
}) {
  const isDone = completed.split(',').includes(type);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: assessmentRoutes[type],
          params: {
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

// Separate brand text keeps the logo styling consistent.
/** Displays the styled MPowered brand text. */
function BrandWord() {
  return (
    <View style={s.brandWord}>
      <Text style={s.brandM}>M</Text>
      <Text style={s.brandPowered}>Powered</Text>
    </View>
  );
}

// Refresh the account and weekly activity whenever Home becomes active.
const content = {
  description: 'Assess your pain intensity and its impacts weekly to create an empowered plan.',
  progressLabel: "This week's progress",
  assessmentTitle: "This week's assessment",
  assessments: ['My Pain', 'My Movement', 'My Personal Care', 'My Social Health', 'My Management'],
} as const;

/** Shows the assessment choices, completion information, and reflection entry point. */
export default function Home() {
  const { completed = '', name: routeName = 'Jane' } = useLocalSearchParams<{
    completed?: string;
    name?: string;
  }>();
  const [profileName, setProfileName] = useState<string>();
  const name = profileName || routeName;
  const [hasReflection, setHasReflection] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(getCompletedAssessments());
  // Refresh on every visit so saving a reflection changes Add to View immediately.
  useFocusEffect(
    useCallback(() => {
      setSessionCompleted(getCompletedAssessments());
      // Ignore a delayed storage response if the user has already left this screen.
      let active = true;
      getProfile()
        .then((profile) => {
          if (active) setProfileName(profile?.name);
        })
        .catch(() => {});
      getReflection()
        .then((saved) => {
          if (active) setHasReflection(!!saved);
        })
        .catch(() => {
          if (active) setHasReflection(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );
  // Merge route and session results without counting an assessment twice.
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
          <Text style={s.bannerCopy}>{content.description}</Text>
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
          <Text style={s.sectionTitle}>{content.assessmentTitle}</Text>
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
              pathname: '/reflection',
              params: {
                flow: 'reflection',
                returnTo: '/dashboard',
                fresh: String(Date.now()),
              },
            })
          }
          style={({ pressed }) => [s.reflection, pressed && s.pressed]}
        >
          <Text style={s.plus}>＋</Text>
          <Text style={s.reflectionText}>
            {hasReflection
              ? 'View your reflection for this week'
              : 'Add a reflection for this week'}
          </Text>
        </Pressable>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
// Keep greeting, progress, card, and footer styles below the logic.
