import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';
import { MhaHeader, palette } from '@/components/mha-ui';
import * as Print from 'expo-print';
const chart = [5, 4, 5, 5, 5, 7, 8, 8, 7];
const chartDates = ['', '05/04', '12/04', '19/04', '26/04', '03/05', '10/05', '17/05', '24/05'];
const initial = [
  ['18–24 May', '7', '9', '6'],
  ['11–17 May', '8', '9', '6'],
  ['04–10 May', '8', '9', '7'],
  ['27 Apr–3 May', '7', '8', '5'],
];
const more = [
  ['20–26 Apr', '5', '7', '4'],
  ['13–19 Apr', '5', '7', '4'],
  ['06–12 Apr', '5', '7', '3'],
  ['30 Mar–5 Apr', '4', '6', '3'],
  ['23–29 Mar', '5', '7', '4'],
];
function buildHealthRecordsHtml() {
  // Expo Print renders HTML through WebKit. Keep the report self-contained and use
  // print-safe SVG/CSS so charts and table rows paginate without being clipped.
  const rows = [...initial, ...more]
    .map(
      (row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`,
    )
    .join('');
  const chartLeft = 42,
    chartRight = 650,
    chartTop = 18,
    chartBottom = 178;
  const chartX = (index: number) =>
    chartLeft + (index * (chartRight - chartLeft)) / (chart.length - 1);
  const chartY = (score: number) => chartBottom - (score / 10) * (chartBottom - chartTop);
  const chartPoints = chart.map((score, index) => `${chartX(index)},${chartY(score)}`).join(' ');
  const chartArea = `${chartLeft},${chartBottom} ${chartPoints} ${chartRight},${chartBottom}`;
  const horizontalGrid = Array.from(
    { length: 11 },
    (_, score) =>
      `<line x1="${chartLeft}" x2="${chartRight}" y1="${chartY(score)}" y2="${chartY(score)}" stroke="#D5CFDC" stroke-width="1" stroke-dasharray="3 4"/><text x="30" y="${chartY(score) + 4}" text-anchor="end" font-size="10" fill="#686173">${score}</text>`,
  ).join('');
  const verticalGrid = chart
    .map(
      (_, index) =>
        `<line x1="${chartX(index)}" x2="${chartX(index)}" y1="${chartTop}" y2="${chartBottom}" stroke="#E5DFF0" stroke-width="1" stroke-dasharray="3 4"/>`,
    )
    .join('');
  const chartLabels = chartDates
    .map((date, index) =>
      date
        ? `<text x="${chartX(index)}" y="202" text-anchor="middle" font-size="9" fill="#686173">${date}</text>`
        : '',
    )
    .join('');
  const chartDots = chart
    .map(
      (score, index) =>
        `<circle cx="${chartX(index)}" cy="${chartY(score)}" r="4" fill="#5E17EB"/>`,
    )
    .join('');
  const chartSvg = `<svg viewBox="0 0 680 215" role="img" aria-label="Average pain intensity chart"><polygon points="${chartArea}" fill="#D8C7FA" fill-opacity="0.48"/>${horizontalGrid}${verticalGrid}<polyline points="${chartPoints}" fill="none" stroke="#8C52FF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${chartDots}${chartLabels}</svg>`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    @page{size:A4 portrait;margin:14mm}
    *{box-sizing:border-box}
    html,body{width:100%;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#201A2B;font-size:13px;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .report{width:100%}
    .brand{border-bottom:3px solid #D8C7FA;padding-bottom:12px;white-space:nowrap}
    .m{font-size:36px;font-weight:900}.powered{font-size:14px;font-weight:800;vertical-align:top}.health{font-size:27px;font-weight:900;color:#8C52FF;margin-left:8px}
    h1{font-size:25px;line-height:1.2;margin:22px 0 5px}.subtitle{color:#686173;margin-bottom:18px}
    .summary{background:#F3EEFF;border:1px solid #BEA1F7;border-radius:14px;padding:15px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
    .summary strong{color:#5E17EB;font-size:18px}
    .chart-card{border:1px solid #E5DFF0;border-radius:14px;padding:13px 14px 8px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
    .chart-title{font-size:16px;font-weight:800;margin-bottom:2px}.chart-caption{font-size:11px;color:#686173;margin-bottom:5px}.chart-card svg{display:block;width:100%;height:auto;max-height:205px}
    h2{font-size:16px;margin:0 0 9px;break-after:avoid;page-break-after:avoid}
    table{width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #E5DFF0}
    thead{display:table-header-group}tfoot{display:table-footer-group}
    tr{break-inside:avoid;page-break-inside:avoid}
    th{background:#5E17EB;color:#fff;text-align:left;padding:10px;border:1px solid #5E17EB}
    td{padding:9px 10px;border:1px solid #E5DFF0;word-wrap:break-word}
    th:first-child,td:first-child{width:40%}tr:nth-child(even) td{background:#F9F8FC}
    .footer{margin-top:18px;padding-top:10px;border-top:1px solid #E5DFF0;color:#686173;font-size:10px;break-inside:avoid;page-break-inside:avoid}
  </style></head><body><main class="report"><div class="brand"><span class="m">M</span><sup class="powered">Powered</sup><span class="health">Health</span></div><h1>My health tracking records</h1><div class="subtitle">Pain intensity · Back and knee · All recorded dates</div><div class="summary"><strong>Latest average: 7/10</strong><br>Tracking overview generated from your M Powered Health records.</div><section class="chart-card"><div class="chart-title">Average pain intensity</div><div class="chart-caption">Weekly score from 0 to 10</div>${chartSvg}</section><h2>Recorded periods</h2><table><thead><tr><th>Period</th><th>Average</th><th>Worst</th><th>Mildest</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">Generated by M Powered Health · For personal health tracking only.</div></main></body></html>`;
}
function TrackingChart({ metric }: { metric: string }) {
  const values = chart.map((value) =>
    metric === 'Worst'
      ? Math.min(10, value + 1)
      : metric === 'Mildest'
        ? Math.max(1, value - 1)
        : value,
  );
  const left = 34,
    right = 354,
    top = 28,
    bottom = 224;
  const x = (index: number) => left + (index * (right - left)) / (values.length - 1);
  const y = (value: number) => bottom - (value / 10) * (bottom - top);
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const area = `${left},${bottom} ${points} ${right},${bottom}`;
  return (
    <View style={s.chartFrame}>
      <Svg width="100%" height={270} viewBox="0 0 370 270">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
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
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
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
        <Polygon points={area} fill="#D8C7FA" fillOpacity="0.46" />
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
          date ? (
            <SvgText
              key={date}
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
function PrintPdfButton() {
  const [printing, setPrinting] = useState(false);
  const printPdf = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      await Print.printAsync({ html: buildHealthRecordsHtml() });
    } catch {
      Alert.alert('PDF unavailable', 'The report could not be opened. Please try again.');
    } finally {
      setPrinting(false);
    }
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Print health tracking PDF"
      disabled={printing}
      onPress={printPdf}
      style={({ pressed }) => [s.print, pressed && s.printPressed, printing && s.printLoading]}
    >
      <View style={s.pdfBadge}>
        <Text style={s.pdfBadgeText}>PDF</Text>
      </View>
      <Text style={s.printText}>{printing ? 'Creating…' : 'Print PDF'}</Text>
    </Pressable>
  );
}
export default function HealthRecords() {
  const [tab, setTab] = useState<'chart' | 'history'>('chart');
  const [metric, setMetric] = useState('Average');
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? [...initial, ...more] : initial;
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.replace('/explore')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <View style={s.titleRow}>
          <Text style={s.title}>My health tracking records</Text>
          <PrintPdfButton />
        </View>
        <View style={s.tabs}>
          {['Chart', 'History'].map((x) => (
            <Pressable
              key={x}
              style={[s.tab, tab === x.toLowerCase() && s.tabOn]}
              onPress={() => setTab(x.toLowerCase() as 'chart' | 'history')}
            >
              <Text style={[s.tabText, tab === x.toLowerCase() && s.tabTextOn]}>{x}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'chart' ? (
          <>
            <View style={s.chartHead}>
              <Text style={s.metricTitle}>Pain intensity</Text>
              <View style={s.filter}>
                <Text style={s.filterText}>Back, knee⌄</Text>
              </View>
            </View>
            <TrackingChart metric={metric} />
            <View style={s.segment}>
              {['Average', 'Worst', 'Mildest'].map((x) => (
                <Pressable
                  key={x}
                  style={[s.segmentItem, metric === x && s.segmentOn]}
                  onPress={() => setMetric(x)}
                >
                  <Text style={[s.segmentText, metric === x && s.segmentTextOn]}>{x}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.table}>
              {rows.map((r, i) => (
                <View key={r[0]} style={[s.tableRow, i === 0 && s.tableFirst]}>
                  {r.map((c, j) => (
                    <Text key={j} style={[s.cell, j === 0 && s.dateCell]}>
                      {c}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
            <Pressable style={s.more} onPress={() => setExpanded((v) => !v)}>
              <Text style={s.moreText}>{expanded ? 'Show fewer records' : 'See more records'}</Text>
            </Pressable>
          </>
        ) : (
          <View style={s.history}>
            {['18–24 May', '11–17 May', '04–10 May', '27 Apr–03 May', '20–26 Apr'].map(
              (date, i) => (
                <View key={date} style={s.historyGroup}>
                  <Text style={s.historyDate}>{date}</Text>
                  {i === 0
                    ? [
                        'My Pain',
                        'My Movement',
                        'My Personal Care',
                        'My Social Health',
                        'My Management',
                      ].map((x) => (
                        <Text key={x} style={s.historyItem}>
                          {x}
                          <Text style={s.historyArrow}> ›</Text>
                        </Text>
                      ))
                    : null}
                </View>
              ),
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
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
  },
  metricTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
  filter: {
    height: 34,
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
