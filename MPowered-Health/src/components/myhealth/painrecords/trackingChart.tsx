import {
  PainAssessmentRecord,
  PainMetric,
  painMetricValue,
  painRecordDate,
} from '@/services/healthDataHelper';
import { palette } from '@/constants/ui/styling';
import { View, StyleSheet } from 'react-native';
import { 
  Svg, 
  Circle, 
  Line, 
  Polygon, 
  Polyline, 
  Text as SvgText 
} from 'react-native-svg';

/** Draws a chart of the selected pain history records */
export function TrackingChart({
  metric,
  records,
}: {
  metric: PainMetric;
  records: PainAssessmentRecord[];
}) {
  // Convert values to coordinates on the fixed zero-to-ten chart
  const values = records.map((record) => painMetricValue(record, metric));
  const chartDates = records.map((record) => painRecordDate(record, true));
  const left = 34,
    right = 354,
    top = 28,
    bottom = 224;

  // Converts a record position into a horizontal chart coordinate
  const x = (index: number) =>
    values.length === 1
      ? (left + right) / 2
      : left + (index * (right - left)) / (values.length - 1);

  // Converts a score into a vertical chart coordinate
  const y = (value: number) => bottom - (value / 10) * (bottom - top);

  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const area = `${x(0)},${bottom} ${points} ${x(values.length - 1)},${bottom}`;
  return (
    <View style={styles.chartFrame}>
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
            stroke={palette.controlBorder}
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
            stroke={palette.controlBorder}
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
            fill={palette.muted}
            textAnchor="end"
          >
            {value}
          </SvgText>
        ))}
        {values.length > 1 ? <Polygon points={area} fill={palette.chartSoft} fillOpacity="0.62" /> : null}
        <Polyline
          points={points}
          fill="none"
          stroke={palette.chart}
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
            fill={palette.chart}
          />
        ))}
        {chartDates.map((date, index) =>
          index % Math.max(1, Math.ceil(values.length / 7)) === 0 || index === values.length - 1 ? (
            <SvgText
              key={records[index].id}
              x={x(index)}
              y="247"
              fontSize="9"
              fill={palette.muted}
              textAnchor="middle"
            >
              {date}
            </SvgText>
          ) : null,
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  chartFrame: {
    marginTop: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: 'hidden',
  },
});