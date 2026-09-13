// This screen groups saved pain assessments and displays recent pain trends.
import { buildHealthRecordsHtml } from '@/features/health/services/health-records-report';
import { PainAssessmentRecord, PainMetric } from '@/features/pain/services/pain-history';
import { printHtml } from '@/shared/export/document-export';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { s } from '../styles/health-records';
export function PrintPdfButton({
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
  // Build the filtered report before opening the platform print dialog.
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
