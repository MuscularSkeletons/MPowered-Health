import { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';
import { MhaHeader, palette } from '@/components/mha-ui';
import {
  getPainHistory,
  groupPainHistory,
  PainAssessmentRecord,
  PainMetric,
  painMetricValue,
  painRecordDate,
} from '@/constants/pain-history';
import { buildHealthRecordsHtml } from '@/utils/health-records-report';
import { printHtml } from '@/utils/pain-profile-export';

function TrackingChart({
  metric,
  records,
}: {
  metric: PainMetric;
  records: PainAssessmentRecord[];
}) {
  const values = records.map((record) => painMetricValue(record, metric));
  const chartDates = records.map((record) => painRecordDate(record, true));
  const left = 34,
    right = 354,
    top = 28,
    bottom = 224;
  const x = (index: number) =>
    values.length === 1
      ? (left + right) / 2
      : left + (index * (right - left)) / (values.length - 1);
  const y = (value: number) => bottom - (value / 10) * (bottom - top);
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const area = `${x(0)},${bottom} ${points} ${x(values.length - 1)},${bottom}`;
  return (
    <View style={s.chartFrame}>
      <Svg
        width="100%"
        height={270}
        viewBox="0 0 370 270"
        accessibilityLabel={`${metric} pain for ${records.length} matching assessments`}
      >
        {Array.from({ length: 11 }, (_, i) => i).map((value) => (
          <Line
            key={`h-${value}`}
            x1={left}
            x2={right}
            y1={y(value)}
            y2={y(value)}
            stroke="#B7B1BD"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        ))}
        {values.map((_, index) => (
          <Line
            key={`v-${index}`}
            x1={x(index)}
            x2={x(index)}
            y1={top}
            y2={bottom}
            stroke="#B7B1BD"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => i).map((value) => (
          <SvgText
            key={`label-${value}`}
            x="24"
            y={y(value) + 4}
            fontSize="10"
            fill="#5F5867"
            textAnchor="end"
          >
            {value}
          </SvgText>
        ))}
        {values.length > 1 ? <Polygon points={area} fill="#D8C7FA" fillOpacity="0.46" /> : null}
        <Polyline
          points={points}
          fill="none"
          stroke={palette.secondary}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((value, index) => (
          <Circle
            key={`point-${index}`}
            cx={x(index)}
            cy={y(value)}
            r="3.2"
            fill={palette.primary}
          />
        ))}
        {chartDates.map((date, index) =>
          index % Math.max(1, Math.ceil(values.length / 7)) === 0 || index === values.length - 1 ? (
            <SvgText
              key={records[index].id}
              x={x(index)}
              y="247"
              fontSize="9"
              fill="#5F5867"
              textAnchor="middle"
            >
              {date}
            </SvgText>
          ) : null,
        )}
      </Svg>
    </View>
  );
}
function PrintPdfButton({
  records,
  areaLabel,
  metric,
}: {
  records: PainAssessmentRecord[];
  areaLabel: string;
  metric: PainMetric;
}) {
  const [printing, setPrinting] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const printPdf = async () => {
    if (pending.current || !records.length) return;
    pending.current = true;
    setPrinting(true);
    setError('');
    try {
      await printHtml(buildHealthRecordsHtml(records, areaLabel, metric));
    } catch {
      setError('The report could not be opened. Please try again.');
    } finally {
      pending.current = false;
      setPrinting(false);
    }
  };
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Print health tracking PDF"
        disabled={printing || !records.length}
        onPress={printPdf}
        style={({ pressed }) => [
          s.print,
          pressed && s.printPressed,
          (printing || !records.length) && s.printLoading,
        ]}
      >
        <View style={s.pdfBadge}>
          <Text style={s.pdfBadgeText}>PDF</Text>
        </View>
        <Text style={s.printText}>{printing ? 'Creating…' : 'Print PDF'}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={s.printError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function HealthRecords() {
  const [tab, setTab] = useState<'chart' | 'history'>('chart');
  const [metric, setMetric] = useState<PainMetric>('Average');
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState(getPainHistory);
  const [selectedKey, setSelectedKey] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setHistory(getPainHistory());
    }, []),
  );
  const groups = groupPainHistory(history);
  const selected = groups.find((group) => group.key === selectedKey) ?? groups[0];
  const records = selected?.records ?? [];
  const newestFirst = [...records].reverse();
  const rows = expanded ? newestFirst : newestFirst.slice(0, 4);
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.replace('/explore')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <View style={s.titleRow}>
          <Text style={s.title}>My health tracking records</Text>
          <PrintPdfButton records={records} areaLabel={selected?.label ?? ''} metric={metric} />
        </View>
        <View style={s.tabs}>
          {(['Chart', 'History'] as const).map((label) => (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === label.toLowerCase() }}
              style={[s.tab, tab === label.toLowerCase() && s.tabOn]}
              onPress={() => setTab(label.toLowerCase() as 'chart' | 'history')}
            >
              <Text style={[s.tabText, tab === label.toLowerCase() && s.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.chartHead}>
          <Text style={s.metricTitle}>Pain intensity</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pain areas: ${selected?.label ?? 'No assessments yet'}`}
            accessibilityState={{ expanded: dropdownOpen, disabled: !groups.length }}
            disabled={!groups.length}
            style={s.filter}
            onPress={() => setDropdownOpen(true)}
          >
            <Text style={s.filterText}>{selected?.label ?? 'No pain areas yet'} ⌄</Text>
          </Pressable>
        </View>
        {!records.length ? (
          <View style={s.empty}>
            <Text style={s.historyDate}>No pain assessments recorded yet</Text>
            <Text style={s.emptyCopy}>
              Complete My Pain to see records grouped by the areas you select.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={s.more}
              onPress={() => router.push({ pathname: '/assessment', params: { type: 'pain' } })}
            >
              <Text style={s.moreText}>Complete My Pain</Text>
            </Pressable>
          </View>
        ) : tab === 'chart' ? (
          <>
            <TrackingChart metric={metric} records={records} />
            <View style={s.segment}>
              {(['Average', 'Worst', 'Mildest'] as const).map((label) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: metric === label }}
                  style={[s.segmentItem, metric === label && s.segmentOn]}
                  onPress={() => setMetric(label)}
                >
                  <Text style={[s.segmentText, metric === label && s.segmentTextOn]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.table}>
              <View style={[s.tableRow, s.tableFirst]}>
                {['Recorded', 'Average', 'Worst', 'Mildest'].map((label, index) => (
                  <Text key={label} style={[s.cell, s.tableHeading, index === 0 && s.dateCell]}>
                    {label}
                  </Text>
                ))}
              </View>
              {rows.map((record) => (
                <View key={record.id} style={s.tableRow}>
                  {[painRecordDate(record), record.average, record.worst, record.mildest].map(
                    (value, index) => (
                      <Text key={index} style={[s.cell, index === 0 && s.dateCell]}>
                        {value}
                      </Text>
                    ),
                  )}
                </View>
              ))}
            </View>
            {records.length > 4 ? (
              <Pressable
                accessibilityRole="button"
                style={s.more}
                onPress={() => setExpanded((value) => !value)}
              >
                <Text style={s.moreText}>
                  {expanded ? 'Show fewer records' : 'See more records'}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <View style={s.history}>
            {newestFirst.map((record) => (
              <View key={record.id} style={s.historyGroup}>
                <Text style={s.historyDate}>{painRecordDate(record)}</Text>
                <Text style={s.historyItem}>My Pain · {selected?.label}</Text>
                <Text style={s.emptyCopy}>
                  Average {record.average}/10 · Worst {record.worst}/10 · Mildest {record.mildest}
                  /10
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <View style={s.overlay}>
          <View style={s.dropdown} accessibilityViewIsModal>
            <Text style={s.historyDate} accessibilityRole="header">
              Choose pain areas
            </Text>
            <Text style={s.emptyCopy}>
              Each option shows assessments with exactly that combination of areas.
            </Text>
            <ScrollView style={s.dropdownList}>
              {groups.map((group) => (
                <Pressable
                  key={group.key}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected?.key === group.key }}
                  style={[s.dropdownOption, selected?.key === group.key && s.dropdownSelected]}
                  onPress={() => {
                    setSelectedKey(group.key);
                    setExpanded(false);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={s.optionLabel}>
                    {group.label}
                    {selected?.key === group.key ? ' ✓' : ''}
                  </Text>
                  <Text style={s.emptyCopy}>
                    {group.records.length}{' '}
                    {group.records.length === 1 ? 'assessment' : 'assessments'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              style={s.more}
              onPress={() => setDropdownOpen(false)}
            >
              <Text style={s.moreText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  printError: { color: '#A52035', fontSize: 12, maxWidth: 160, marginTop: 6 },
  empty: { marginTop: 24, paddingVertical: 24 },
  emptyCopy: { fontSize: 13, lineHeight: 20, color: palette.muted },
  tableHeading: { fontWeight: '700', backgroundColor: '#F3EEFF' },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdown: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  dropdownList: { flexShrink: 1, marginTop: 12 },
  dropdownOption: {
    minHeight: 58,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: palette.line,
  },
  dropdownSelected: { backgroundColor: '#F3EEFF', borderColor: palette.primary },
  optionLabel: { color: palette.text, fontSize: 14, fontWeight: '700', lineHeight: 21 },
  chartFrame: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: 'hidden',
  },
  safe: { flex: 1, backgroundColor: '#fff' },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120,
  },
  back: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: palette.text,
  },
  print: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  printPressed: {
    backgroundColor: palette.primaryDark,
    transform: [{ scale: 0.97 }],
  },
  printLoading: { opacity: 0.72 },
  pdfBadge: {
    height: 26,
    minWidth: 30,
    borderRadius: 8,
    backgroundColor: palette.light,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  pdfBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    color: palette.primaryDark,
  },
  printText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  tabs: {
    height: 48,
    backgroundColor: '#F3EEFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabOn: { borderBottomColor: palette.primary },
  tabText: { fontSize: 12, color: palette.text },
  tabTextOn: { fontWeight: '800', color: palette.primary },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
  filter: {
    minHeight: 44,
    maxWidth: '100%',
    flexShrink: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  filterText: { fontSize: 11, color: palette.text },
  chart: {
    height: 190,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    marginTop: 14,
    overflow: 'hidden',
  },
  chartColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  area: {
    backgroundColor: '#F3EEFF',
    borderTopWidth: 2,
    borderTopColor: palette.secondary,
  },
  point: {
    position: 'absolute',
    alignSelf: 'center',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.primary,
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisText: { fontSize: 7, color: palette.muted },
  segment: {
    height: 34,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    overflow: 'hidden',
    marginTop: 18,
  },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: '#F3EEFF' },
  segmentText: { fontSize: 11, color: palette.text },
  segmentTextOn: { fontWeight: '800', color: palette.primaryDark },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableRow: {
    minHeight: 34,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  tableFirst: { borderTopWidth: 0 },
  cell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: palette.text,
    padding: 7,
  },
  dateCell: { flex: 1.35, textAlign: 'left' },
  more: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3EEFF',
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  moreText: { fontSize: 11, fontWeight: '800', color: palette.text },
  history: { marginTop: 14 },
  historyGroup: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 8,
  },
  historyItem: { fontSize: 13, lineHeight: 27, color: palette.text },
  historyArrow: { color: palette.primary },
});
