import { PrintPDFButton } from '@/components/myhealth/painrecords/printPainRecordPDFButton';
import { TrackingChart } from '@/components/myhealth/painrecords/trackingChart';
import { 
  painRecordDate, 
  getPainHistory,
  groupPainHistory,
  type PainMetric, 
} from '@/services/healthDataHelper';
import { 
  Screen,
  Intro,
  commonStyles,
} from '@/components/shared/common';
import { palette } from '@/constants/ui/styling';
import { Feather } from "@react-native-vector-icons/feather";
import { router, useFocusEffect } from 'expo-router';
import { 
  Modal, 
  Pressable, 
  ScrollView, 
  Text, 
  View, 
  StyleSheet 
} from 'react-native';
import { useCallback, useState } from 'react';

/**
 * Displays graphical or table representation of user pain history
 * Data points derived from average, worst or midlest pain
 * Data filtered by pain location
 * Chart and tables can be printed
 * History tab displays text version
 */
export default function PainRecords() {
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
  // Keep the selected group when it exists, or use the first group.
  const groups = groupPainHistory(history);
  const selected = groups.find((group) => group.key === selectedKey) ?? groups[0];
  const records = selected?.records ?? [];
  const newestFirst = [...records].reverse();
  // Show recent records first and reveal older ones only on request.
  const rows = expanded ? newestFirst : newestFirst.slice(0, 4);

  return (
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <View style={styles.titleRow}>
        <Intro
          sectionLabel="TRACKING RECORDS"
          title="Pain Records"
        />
        <PrintPDFButton records={records} areaLabel={selected?.label ?? ''} metric={metric} />
      </View>
      <View style={styles.tabs}>
        {(['Chart', 'History'] as const).map((label) => (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === label.toLowerCase() }}
            style={[styles.tab, tab === label.toLowerCase() && styles.tabOn]}
            onPress={() => setTab(label.toLowerCase() as 'chart' | 'history')}
          >
            <Text style={[styles.tabText, tab === label.toLowerCase() && styles.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.chartHead}>
        <Text style={styles.metricTitle}>Pain intensity</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pain areas: ${selected?.label ?? 'No assessments yet'}`}
          accessibilityState={{ expanded: dropdownOpen, disabled: !groups.length }}
          disabled={!groups.length}
          style={styles.filter}
          onPress={() => setDropdownOpen(true)}
        >
          <View style={styles.filterContent}>
            <Text numberOfLines={1} style={styles.filterText}>
              {selected?.label ?? 'No pain areas yet'}
            </Text>
            <Feather name="chevron-down" size={16} color={palette.muted} />
          </View>
        </Pressable>
      </View>
      {records.length && tab === 'chart' ? (
        <View style={styles.segment}>
          {(['Average', 'Worst', 'Mildest'] as const).map((label) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: metric === label }}
              style={[styles.segmentItem, metric === label && styles.segmentOn]}
              onPress={() => setMetric(label)}
            >
              <Text style={[styles.segmentText, metric === label && styles.segmentTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {!records.length ? (
        <View style={styles.empty}>
          <Text style={styles.historyDate}>No pain assessments recorded yet</Text>
          <Text style={styles.emptyCopy}>
            Records will appear here when pain assessments are available.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.more}
            onPress={() => router.push('/(tabs)/(assessment)')}
          >
            <Text style={styles.moreText}>Open Pain Tracker</Text>
          </Pressable>
        </View>
      ) : tab === 'chart' ? (
        <>
          <TrackingChart metric={metric} records={records} />
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableFirst]}>
              {['Recorded', 'Average', 'Worst', 'Mildest'].map((label, index) => (
                <Text key={label} style={[styles.cell, styles.tableHeading, index === 0 && styles.dateCell]}>
                  {label}
                </Text>
              ))}
            </View>
            {rows.map((record) => (
              <View key={record.id} style={styles.tableRow}>
                {[painRecordDate(record), record.average, record.worst, record.mildest].map(
                  (value, index) => (
                    <Text key={index} style={[styles.cell, index === 0 && styles.dateCell]}>
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
              style={styles.more}
              onPress={() => setExpanded((value) => !value)}
            >
              <Text style={styles.moreText}>
                {expanded ? 'Show fewer records' : 'See more records'}
              </Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <View style={styles.history}>
          {newestFirst.map((record) => (
            <View key={record.id} style={styles.historyGroup}>
              <Text style={styles.historyDate}>{painRecordDate(record)}</Text>
              <Text style={styles.historyItem}>My Pain · {selected?.label}</Text>
              <Text style={styles.emptyCopy}>
                Average {record.average}/10 · Worst {record.worst}/10 · Mildest {record.mildest}
                /10
              </Text>
            </View>
          ))}
        </View>
      )}
    <Modal
      visible={dropdownOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setDropdownOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dropdown} accessibilityViewIsModal>
          <Text style={styles.historyDate} accessibilityRole="header">
            Filter by pain area
          </Text>
          <Text style={styles.emptyCopy}>
            Display assessment results for the given pain area.
          </Text>
          <ScrollView style={styles.dropdownList}>
            {groups.map((group) => (
              <Pressable
                key={group.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected?.key === group.key }}
                style={[styles.dropdownOption, selected?.key === group.key && styles.dropdownSelected]}
                onPress={() => {
                  setSelectedKey(group.key);
                  setExpanded(false);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.optionLabel}>
                  {group.label}
                  {selected?.key === group.key ? ' ✓' : ''}
                </Text>
                <Text style={styles.emptyCopy}>
                  {group.records.length}{' '}
                  {group.records.length === 1 ? 'assessment' : 'assessments'}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            style={styles.more}
            onPress={() => setDropdownOpen(false)}
          >
            <Text style={styles.moreText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { marginTop: 24, paddingVertical: 24 },
  emptyCopy: { fontSize: 13, lineHeight: 20, color: palette.muted },
  tableHeading: { fontWeight: '700', backgroundColor: palette.selectionBackground },
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
    backgroundColor: palette.surface,
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
  dropdownSelected: { backgroundColor: palette.selectionBackground, borderColor: palette.primary },
  optionLabel: { color: palette.text, fontSize: 14, fontWeight: '700', lineHeight: 21 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tabs: {
    height: 48,
    backgroundColor: palette.selectionBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: 'hidden',
    flexDirection: 'row',
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
  filterContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterText: { flexShrink: 1, fontSize: 11, color: palette.text },
  segment: {
    height: 34,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    overflow: 'hidden',
    marginTop: 12,
  },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: palette.selectionBackground },
  segmentText: { fontSize: 11, color: palette.text },
  segmentTextOn: { fontWeight: '800', color: palette.primary },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: palette.surface,
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
    backgroundColor: palette.selectionBackground,
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
});

