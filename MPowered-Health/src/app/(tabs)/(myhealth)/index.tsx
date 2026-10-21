import { 
  Screen,
  Intro, 
  commonStyles,
} from '@/components/shared/common';
import { palette, radius, spacing, layout } from '@/constants/ui/styling';
import {
  getPainHistory,
  loadHealthRecords,
  painRecordDate,
  type PainAssessmentRecord,
} from '@/services/healthDataHelper';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

const CHART_SIDE_GUTTER = 24;
const CHART_BASELINE = 82;
const PIXELS_PER_SCORE = 6;
const LINE_THICKNESS = 4;

/** Graphical display tracking the user's average pain scores */
function PainTrend({ records }: { records: PainAssessmentRecord[] }) {
  const [width, setWidth] = useState(0);
  const values = records.map((record) => ({
    date: painRecordDate(record, true),
    score: record.average,
  }));
  const points = (width > 0 ? values : []).map((record, index) => ({
    x:
      values.length === 1
        ? width / 2
        : CHART_SIDE_GUTTER +
          (index * (width - CHART_SIDE_GUTTER * 2)) / (values.length - 1),
    y: CHART_BASELINE - record.score * PIXELS_PER_SCORE,
    ...record,
  }));

  const segment = (start: (typeof points)[number], end: (typeof points)[number]) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      position: 'absolute' as const,
      left: (start.x + end.x - length) / 2,
      top: (start.y + end.y) / 2 - LINE_THICKNESS / 2,
      width: length,
      height: LINE_THICKNESS,
      borderRadius: 2,
      backgroundColor: palette.chart,
      transform: [{ rotate: `${angle}deg` }],
    };
  };

  return (
    <View style={styles.trend} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.chart}>
        {points.slice(0, -1).map((point, index) => (
          <View key={`line-${point.date}-${index}`} style={segment(point, points[index + 1])} />
        ))}
        {points.map((point, index) => (
          <View
            key={`${point.date}-${index}`}
            style={[
              styles.point,
              { left: point.x - 6, top: point.y - 6 },
              index === points.length - 1 && styles.pointLast,
            ]}
          >
            <Text style={styles.number}>{point.score}</Text>
          </View>
        ))}
      </View>
      <View style={styles.dateCanvas}>
        {points.map((point, index) => (
          <Text key={`${point.date}-date-${index}`} style={[styles.date, { left: point.x - 20 }]}>
            {point.date}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** 
 * Contains:
  * shows the user's average pain trend as a piecewise function
  * navigation to health profile (display summaries of the 5 assessments)
  * navigation to pain records (more in-depth details about user pain trend) 
  * navigation to prescription feature
*/
export default function MyHealthScreen() {
  const [records, setRecords] = useState(getPainHistory());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadHealthRecords()
        .then(() => {
          if (active) setRecords(getPainHistory());
        })
        .catch(() => {
          // Keep the last successfully loaded records visible if a refresh fails.
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const recentRecords = records.slice(-5);

  return (
    <Screen>
      <Intro
        sectionLabel="MY HEALTH"
        title="Understand your health over time"
        description="Review your pain trends and keep your prescriptions in one place."
      />

      <View style={styles.quickRow}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.quick, styles.quickPink, pressed && styles.quickPressed]}
          onPress={() => router.push('/(tabs)/(myhealth)/healthprofile')}
        >
          <Text style={styles.quickText}>My health profile</Text>
          <Text style={styles.quickArrow}>View ›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.quick, styles.quickGreen, pressed && styles.quickPressed]}
          onPress={() => router.push('/(tabs)/(myhealth)/(prescriptions)')}
        >
          <Text style={[styles.quickText, styles.quickTextOnDark]}>My prescriptions</Text>
          <Text style={[styles.quickArrow, styles.quickArrowOnDark]}>View ›</Text>
        </Pressable>
      </View>

      <View style={styles.insights}>
        <View style={styles.insightMeta}>
          <View style={styles.insightTitleGroup}>
            <Text style={styles.insightHeading}>Average pain trend</Text>
            <Text style={styles.insightLabel}>Your five most recent pain assessments</Text>
          </View>
          <Text style={styles.recordCount}>{records.length} records</Text>
        </View>
        {recentRecords.length ? (
          <PainTrend records={recentRecords} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No pain records yet</Text>
            <Text style={styles.emptyCopy}>
              Complete a pain assessment to see your progress here.
            </Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.historyButton, pressed && styles.quickPressed]}
          onPress={() => router.push('/(tabs)/(myhealth)/painrecords')}
        >
          <Text style={styles.historyButtonText}>View all pain records</Text>
        </Pressable>
      </View>
      <Text style={commonStyles.sponsor}>Supported by ABBVIE</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: 'row', gap: spacing.md },
  quick: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.light,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    shadowColor: palette.text,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  quickPink: { backgroundColor: palette.chartSoft, borderColor: palette.pinkBorder },
  quickGreen: { backgroundColor: palette.success, borderColor: palette.greenBorder },
  quickPressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  quickText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
  },
  quickTextOnDark: { color: palette.surface },
  quickArrow: { fontSize: 13, lineHeight: 18, fontWeight: '700', color: palette.success },
  quickArrowOnDark: { color: palette.surface },
  insights: {
    marginTop: spacing.xl,
    backgroundColor: palette.softBlue,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.blueBorder,
    padding: layout.cardPadding,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  insightTitleGroup: { flex: 1 },
  insightHeading: { fontSize: 20, lineHeight: 26, fontWeight: '800', color: palette.text },
  insightLabel: { marginTop: 2, fontSize: 13, lineHeight: 19, color: palette.muted },
  recordCount: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: palette.primary,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trend: { width: '100%' },
  chart: {
    height: 96,
    position: 'relative',
    marginTop: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.light,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.chartSoft,
  },
  pointLast: { backgroundColor: palette.chart, width: 14, height: 14, borderRadius: 7 },
  number: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: palette.text,
    left: -1,
    top: -25,
  },
  dateCanvas: { height: 28, position: 'relative' },
  date: {
    position: 'absolute',
    width: 40,
    textAlign: 'center',
    fontSize: 10,
    color: palette.muted,
    top: spacing.sm,
  },
  emptyState: {
    marginTop: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: palette.text },
  emptyCopy: { marginTop: spacing.xs, textAlign: 'center', fontSize: 13, color: palette.muted },
  historyButton: {
    minHeight: 48,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: palette.chartSoft,
    borderWidth: 1,
    borderColor: palette.pinkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  historyButtonText: { fontSize: 14, fontWeight: '800', color: palette.success },
});
