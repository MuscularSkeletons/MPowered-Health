import { PrintPdfButton } from '@/components/my-health/printPDFButton';
import { TrackingChart } from '@/components/my-health/trackingChart';
import { healthRecordStyles as styles } from '@/components/my-health/healthRecordStyles';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { painRecordDate } from '@/services/healthRecords.store';
import { 
  Screen,
  Intro,
  commonStyles,
} from '@/components/ui/common';
import { palette } from '@/constants/ui/styling';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

/**
 * Displays recorded pain history and the controls for filtering and exporting it.
 *
 * Coordinate filters, chart/history tabs, record groups, and printing.
 */
export default function HealthRecords() {
  const {
    tab,
    setTab,
    metric,
    setMetric,
    expanded,
    setExpanded,
    setSelectedKey,
    dropdownOpen,
    setDropdownOpen,
    groups,
    selected,
    records,
    rows,
    newestFirst,
  } = useHealthRecords();
  return (
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <View style={styles.titleRow}>
        <Intro
          sectionLabel="TRACKING RECORDS"
          title="Pain Records"
        />
        <PrintPdfButton records={records} areaLabel={selected?.label ?? ''} metric={metric} />
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
