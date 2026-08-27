import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, palette } from '@/components/mha-ui';
import { getPainRecords, PainRecord } from '@/constants/assessment-session';

function PainTrend({ records }: { records: PainRecord[] }) {
  const width = Math.max(310, records.length * 68);
  const points = records.map((r, i) => ({
    x: 18 + (records.length === 1 ? 0 : (i * (width - 36)) / (records.length - 1)),
    y: 82 - r.score * 6,
    ...r,
  }));
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={records.length > 4}
      contentContainerStyle={{ width }}
    >
      <View>
        <View style={[s.chart, { width }]}>
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
        <View style={[s.dateCanvas, { width }]}>
          {points.map((p, i) => (
            <Text key={`${p.date}-date-${i}`} style={[s.date, { left: p.x - 20 }]}>
              {p.date}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default function Health() {
  const [records, setRecords] = useState(getPainRecords());
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
                pathname: '/workflow',
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
                pathname: '/workflow',
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
            <Text style={s.recordCount}>{records.length} records</Text>
          </View>
          <PainTrend records={records} />
          <View style={s.actions}>
            <Pressable style={s.action} onPress={() => router.push('/health-records')}>
              <Text style={s.actionText}>Check pain history</Text>
            </Pressable>
            <Pressable style={s.action} onPress={() => router.push('/care')}>
              <Text style={s.actionText}>Plan appointment with doctors</Text>
            </Pressable>
            <Pressable
              style={[s.action, s.actionLast]}
              onPress={() => router.push({ pathname: '/workflow', params: { flow: 'tips' } })}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 116,
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: palette.text,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: palette.primary,
    marginBottom: 7,
  },
  heroTitle: { marginBottom: 0 },
  heroLine: {
    minHeight: 33,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  heroText: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.55,
    color: palette.text,
  },
  brandWord: { position: 'relative', width: 76, height: 33 },
  powered: {
    fontSize: 13,
    lineHeight: 14,
    fontWeight: '800',
    color: palette.text,
    position: 'absolute',
    left: 22,
    top: 0,
  },
  profile: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: '#F3EEFF',
    borderWidth: 1,
    borderColor: '#E3D9F6',
    padding: 18,
    shadowColor: '#5E17EB',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  profileTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    color: palette.text,
  },
  updated: { fontSize: 12, lineHeight: 17, color: palette.muted, marginTop: 6 },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  heart: {
    width: 36,
    fontSize: 30,
    lineHeight: 36,
    color: palette.primary,
    textAlign: 'center',
  },
  profileCopy: { flex: 1, fontSize: 13, lineHeight: 19, color: palette.text },
  profileButton: {
    alignSelf: 'flex-end',
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D9F6',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  quickRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  quick: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D9F6',
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#32165C',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickPressed: { backgroundColor: '#F3EEFF', transform: [{ scale: 0.98 }] },
  quickText: {
    flex: 1,
    paddingRight: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: palette.text,
  },
  quickArrow: { fontSize: 24, lineHeight: 24, color: palette.primary },
  insights: {
    marginTop: 24,
    backgroundColor: '#F3EEFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3D9F6',
    padding: 18,
  },
  insightHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '800',
    color: palette.text,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 15,
    marginBottom: 2,
  },
  insightLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: palette.text,
  },
  recordCount: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: palette.primary,
    backgroundColor: '#D8C7FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chart: {
    height: 88,
    position: 'relative',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DED5EA',
    borderRadius: 14,
    overflow: 'hidden',
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.secondary,
  },
  pointLast: {
    backgroundColor: palette.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  number: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: palette.text,
    left: -1,
    top: -25,
  },
  dateCanvas: { height: 27, position: 'relative' },
  date: {
    position: 'absolute',
    width: 40,
    textAlign: 'center',
    fontSize: 10,
    color: palette.muted,
    top: 7,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DED5EA',
    backgroundColor: '#FFFFFF',
  },
  action: {
    flex: 1,
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#DED5EA',
  },
  actionLast: { borderRightWidth: 0 },
  actionText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    color: palette.text,
  },
  sponsor: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 28,
  },
});
