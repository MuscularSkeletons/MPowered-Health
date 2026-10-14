/** Connects the health-record report to the print button and error feedback. */
// This hook prepares the history groups and selections used by the records screen.
import { buildHealthRecordsHtml } from '@/lib/health-records-report';
import type { PainAssessmentRecord, PainMetric } from '@/services/health-records.store';
import { printHtml } from '@/lib/document-export';
import { palette } from '@/constants/profile/ui';
import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { healthRecordStyles as s } from './health-record-styles';

/** Displays the button that prints the health-record report. */
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

  /**
   * Builds the health-record report and opens the print dialog.
   *
   * Build the filtered report before opening the platform print dialog.
   */
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
        accessibilityLabel="Print pain records PDF"
        disabled={printing || !records.length}
        onPress={printPdf}
        style={({ pressed }) => [
          s.print,
          pressed && s.printPressed,
          (printing || !records.length) && s.printLoading,
        ]}
      >
        <Feather name="printer" size={16} color={palette.success} />
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
