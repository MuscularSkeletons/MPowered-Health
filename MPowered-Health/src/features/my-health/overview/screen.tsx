import { s } from '@/features/my-health/overview/styles';
// This screen gives the user access to health records, profiles, and guidance.
import { getPainRecords, PainRecord } from '@/features/pain-tracker/session';
import { MhaHeader, palette } from '@/shared/ui/mha-ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Turn saved weekly scores into a small trend chart for the health overview.
function PainTrend({ records }: { records: PainRecord[] }) {
  const [width, setWidth] = useState(0);
  const points = (width > 0 ? records : []).map((r, i) => ({
    x: records.length === 1 ? width / 2 : 24 + (i * (width - 48)) / (records.length - 1),
    y: 82 - r.score * 6,
    ...r,
  }));
  // Rotate and size a view to connect two score points.
  const segment = (a: (typeof points)[number], b: (typeof points)[number]) => {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.sqrt(dx * dx + dy * dy),
      angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      position: 'absolute' as const,
      left: (a.x + b.x - length) / 2,
      top: (a.y + b.y) / 2 - 2,
      width: length,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.primary,
      transform: [{ rotate: `${angle}deg` }],
    };
  };
  return (
    <View style={s.trend} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={s.chart}>
        {points.slice(0, -1).map((p, i) => (
          <View key={`line-${i}`} style={segment(p, points[i + 1])} />
        ))}
        {points.map((p, i) => (
          <View
            key={`${p.date}-${i}`}
            style={[
              s.point,
              { left: p.x - 6, top: p.y - 6 },
              i === points.length - 1 && s.pointLast,
            ]}
          >
            <Text style={s.number}>{p.score}</Text>
          </View>
        ))}
      </View>
      <View style={s.dateCanvas}>
        {points.map((p, i) => (
          <Text key={`${p.date}-date-${i}`} style={[s.date, { left: p.x - 20 }]}>
            {p.date}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Refresh health data and link to records, profile, and guidance.
export default function Health() {
  const [records, setRecords] = useState(getPainRecords());
  // Limit the graph to five records so its labels stay readable.
  const recentRecords = records.slice(-5);
  useFocusEffect(useCallback(() => setRecords(getPainRecords()), []));
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>MY HEALTH</Text>
        <View style={s.heroTitle}>
          <View style={s.heroLine}>
            <Text style={s.heroText}>Your </Text>
            <View style={s.brandWord}>
              <Text style={s.heroText}>M</Text>
              <Text style={s.powered}>Powered</Text>
            </View>
            <Text style={s.heroText}> Health Profile</Text>
          </View>
          <Text style={s.heroText}>has been created</Text>
        </View>
        <View style={s.profile}>
          <Text style={s.updated}>Updated by 18 Feb 2026</Text>
          <View style={s.profileInfo}>
            <Text style={s.heart}>♡</Text>
            <Text style={s.profileCopy}>
              This pain profile will be generated each time you complete the impact questions.
            </Text>
          </View>
          <Pressable
            style={s.profileButton}
            onPress={() =>
              router.push({
                pathname: '/profile',
                params: { flow: 'profile' },
              })
            }
          >
            <Text style={s.profileButtonText}>Open my pain profile</Text>
          </Pressable>
        </View>
        <View style={s.quickRow}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [s.quick, pressed && s.quickPressed]}
            onPress={() => router.push('/health-records')}
          >
            <Text style={s.quickText}>Check my health tracking records</Text>
            <Text style={s.quickArrow}>›</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [s.quick, pressed && s.quickPressed]}
            onPress={() =>
              router.push({
                pathname: '/prescriptions',
                params: { flow: 'prescriptions' },
              })
            }
          >
            <Text style={s.quickText}>Check my prescriptions</Text>
            <Text style={s.quickArrow}>›</Text>
          </Pressable>
        </View>
        <View style={s.insights}>
          <Text style={s.insightHeading}>New insights for your MPowered plan.</Text>
          <View style={s.insightMeta}>
            <Text style={s.insightLabel}>Your average pain increased</Text>
            <Text style={s.recordCount}>{recentRecords.length} records</Text>
          </View>
          <PainTrend records={recentRecords} />
          <View style={s.actions}>
            <Pressable style={s.action} onPress={() => router.push('/health-records')}>
              <Text style={s.actionText}>Check pain history</Text>
            </Pressable>
            <Pressable style={s.action} onPress={() => router.push('/care')}>
              <Text style={s.actionText}>Plan appointment with doctors</Text>
            </Pressable>
            <Pressable
              style={[s.action, s.actionLast]}
              onPress={() =>
                router.push({
                  pathname: '/tips',
                  params: { flow: 'tips', returnTo: '/explore' },
                })
              }
            >
              <Text style={s.actionText}>Check Pain Guide</Text>
            </Pressable>
          </View>
        </View>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Group chart, card, and navigation styles below the screen.
