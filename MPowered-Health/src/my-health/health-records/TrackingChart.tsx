// This screen groups saved pain assessments and displays recent pain trends.
import {
  PainAssessmentRecord,
  PainMetric,
  painMetricValue,
  painRecordDate,
} from '@/shared/health-records/pain-history';
import { palette } from '@/shared/ui/mha-ui';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import { s } from './styles';
export function TrackingChart({
  metric,
  records,
}: {
  metric: PainMetric;
  records: PainAssessmentRecord[];
}) {
  // Convert values to coordinates on the fixed zero-to-ten chart.
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
