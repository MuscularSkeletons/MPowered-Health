import { PrintPdfButton } from '@/features/my-health/health-records/PrintPdfButton';
import { TrackingChart } from '@/features/my-health/health-records/TrackingChart';
import { useHealthRecords } from './useRecords';
import { s } from '@/features/my-health/health-records/styles';
// This screen groups saved pain assessments and displays recent pain trends.
import { painRecordDate } from '@/features/pain-tracker/my-pain/history';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Coordinate filters, chart/history tabs, record groups, and printing.
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
// Group chart, filter, history, and modal styles in one section.
