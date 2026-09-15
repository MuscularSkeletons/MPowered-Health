/** Displays profile details and summaries of recorded assessment answers. */
import type { AssessmentId } from '@/shared/health-records/assessment-types';
import { getProfile } from '@/shared/account/repository';
import { asSentence, buildSummary } from '@/shared/health-records/summaries';
import { getAssessmentAnswers, getLatestAssessmentDate } from '@/shared/health-records/session';
import { ProfileExportActions } from './sharing/ExportActions';
import { ProfileSection } from './sharing/report';
import { s } from './styles';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Displays a titled group of profile summary rows. */
function ProfileSummaryCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: [string, string][];
}) {
  return (
    <View style={s.profileSummaryCard}>
      <Text style={s.profileSummaryTitle}>{title}</Text>
      {subtitle ? <Text style={s.profileSummarySubtitle}>{subtitle}</Text> : null}
      <View style={s.profileSummaryRule} />
      {items.map(([label, value]) => (
        <View key={label} style={s.profileSummaryItem}>
          <Text style={s.profileSummaryLabel}>{label}</Text>
          <Text style={s.profileSummaryValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Displays profile details and summaries of recorded assessment answers. */
export default function PainProfileSummary() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const loadProfile = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    getProfile()
      .then(setProfile)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    let active = true;
    getProfile()
      .then((value) => {
        if (active) setProfile(value);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const sources = {
    pain: getAssessmentAnswers('pain') ?? {},
    movement: getAssessmentAnswers('movement') ?? {},
    personal: getAssessmentAnswers('personal') ?? {},
    social: getAssessmentAnswers('social') ?? {},
    management: getAssessmentAnswers('management') ?? {},
  };

  /** Builds profile summary rows and marks answers that have not been recorded. */
  const rows = (type: AssessmentId, answers: Record<number, string[]>) => {
    const indexes: Record<string, number[]> = {
      pain: [0, 1, 2, 3, 4, 5],
      movement: [0, 1, 2, 3, 4, 5, 6],
      personal: [0, 1, 2, 3],
      social: [0, 1, 2, 3, 4, 6],
      management: [0, 2, 3],
    };
    return buildSummary(type, answers)
      .filter((item) => !item.title.startsWith('My reflection'))
      .map((item, index): [string, string] => {
        const recorded = !!answers[indexes[type][index]]?.length;
        const title = type === 'pain' && !recorded ? item.title.replace(/: 0$/, '') : item.title;
        return [title, recorded ? asSentence(item.text) : 'Not recorded'];
      });
  };

  const sections: ProfileSection[] = [
    {
      title: 'About me',
      subtitle: '',
      items: [
        ['Name', profile?.name || 'Not recorded'],
        ['Sex', profile?.sex || 'Not recorded'],
        ['Age group', profile?.birthYear || 'Not recorded'],
      ],
    },
    {
      title: 'My conditions',
      subtitle: '',
      items: [
        ['Primary condition', profile?.diagnosis || 'Not recorded'],
        [
          'Other conditions',
          [...(profile?.conditions ?? []), profile?.otherConditions ?? '']
            .filter(Boolean)
            .join(', ') || 'Not recorded',
        ],
      ],
    },
    {
      title: 'My Pain',
      subtitle: 'Severity, pattern, and location',
      items: rows('pain', sources.pain),
    },
    { title: 'Impacts to Movement', subtitle: '', items: rows('movement', sources.movement) },
    { title: 'Impacts to Personal care', subtitle: '', items: rows('personal', sources.personal) },
    { title: 'Impacts to Social Health', subtitle: '', items: rows('social', sources.social) },
    { title: 'My Current Management', subtitle: '', items: rows('management', sources.management) },
  ];
  const report = { updatedAt: getLatestAssessmentDate(), sections };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView
        contentContainerStyle={s.profileSummaryContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.replace('/explore')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <View style={s.profileSummaryHeader}>
          <Text style={s.profileSummaryHeading} accessibilityRole="header">
            My Pain Profile
          </Text>
          <ProfileExportActions report={report} disabled={loading || loadError} />
        </View>
        <Text style={s.profileSummaryUpdated}>
          {report.updatedAt ? `Updated ${report.updatedAt}` : 'No completed assessments yet'}
        </Text>
        <Text style={s.profileSummaryIntro}>A summary of your latest completed assessments.</Text>
        {loading ? <Text style={s.profileSummaryIntro}>Loading profile…</Text> : null}
        {loadError ? (
          <View>
            <Text accessibilityRole="alert" style={s.profileSummaryIntro}>
              Your profile could not be loaded. Please try again before printing or sharing.
            </Text>
            <Pressable accessibilityRole="button" onPress={loadProfile}>
              <Text style={s.back}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
        {sections.map((section) => (
          <ProfileSummaryCard key={section.title} {...section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
