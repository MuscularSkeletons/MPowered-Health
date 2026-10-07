import type { AssessmentId } from '@/shared/health-records/assessment-types';
import { useAuth } from '@/context/authcontext';
import { asSentence, buildSummary } from '@/shared/health-records/summaries';
import { getAssessmentAnswers, getLatestAssessmentDate } from '@/shared/health-records/session';
import { ProfileExportActions } from './sharing/ExportActions';
import { ProfileSection } from './sharing/report';
import { s } from './styles';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
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
  const { user } = useAuth();
  const profile = user ? {
    name: user.name,
    sex: user.birthsex,
    birthYear: user.birthyear?.toString(),
    diagnosis: user.formalDiagnosis === undefined ? '' : user.formalDiagnosis ? 'Yes' : 'No',
    conditions: user.painConditions,
    otherConditions: user.otherCondition,
  } : null;
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
        ['Year of birth', profile?.birthYear || 'Not recorded'],
      ],
    },
    {
      title: 'My conditions',
      subtitle: '',
      items: [
        ['Formal diagnosis', profile?.diagnosis || 'Not recorded'],
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
        <Pressable onPress={() => router.replace('/(tabs)/myhealth')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <View style={s.profileSummaryHeader}>
          <Text style={s.profileSummaryHeading} accessibilityRole="header">
            My Pain Profile
          </Text>
          <ProfileExportActions report={report} disabled={!profile} />
        </View>
        <Text style={s.profileSummaryUpdated}>
          {report.updatedAt ? `Updated ${report.updatedAt}` : 'No completed assessments yet'}
        </Text>
        <Text style={s.profileSummaryIntro}>A summary of your latest completed assessments.</Text>
        {sections.map((section) => (
          <ProfileSummaryCard key={section.title} {...section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
