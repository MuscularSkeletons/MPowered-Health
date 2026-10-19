import { 
  Screen,
  Intro, 
} from '@/components/ui/common';
import { overviewStyles as styles } from '@/components/my-health/overviewStyles';
import { palette } from '@/constants/ui/styling';
import {
  getPainHistory,
  loadHealthRecords,
  painRecordDate,
  type PainAssessmentRecord,
} from '@/services/healthRecords.store';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const CHART_SIDE_GUTTER = 24;
const CHART_BASELINE = 82;
const PIXELS_PER_SCORE = 6;
const LINE_THICKNESS = 4;

/** Draws a compact overview of the most recent average pain scores. */
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

/** Shows the user's health trend and the two My Health destinations. */
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
          onPress={() => router.push('/(tabs)/(myhealth)/profile')}
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
          onPress={() => router.push('/(tabs)/(myhealth)/healthrecords')}
        >
          <Text style={styles.historyButtonText}>View all pain records</Text>
        </Pressable>
      </View>
      <Text style={styles.sponsor}>Supported by ABBVIE</Text>
    </Screen>
  );
}
