
import { buildPainRecordsHtml } from '@/services/painRecordReportPDF';
import type { PainAssessmentRecord, PainMetric } from '@/services/healthDataHelper';
import { printHtml } from '@/utils/documentExport';
import { palette, radius, spacing } from '@/constants/ui/styling';
import { Feather } from "@react-native-vector-icons/feather";
import { useRef, useState } from 'react';
import { 
  Pressable, 
  Text, 
  View,
  StyleSheet, 
} from 'react-native';

/** Displays the button that prints the pain record report */
export function PrintPDFButton({
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

  // Builds the pain record report and opens the print dialog
  const printPdf = async () => {
    if (pending.current || !records.length) return;
    pending.current = true;
    setPrinting(true);
    setError('');
    try {
      await printHtml(buildPainRecordsHtml(records, areaLabel, metric));
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
          styles.print,
          pressed && styles.printPressed,
          (printing || !records.length) && styles.printLoading,
        ]}
      >
        <Feather name="printer" size={16} color={palette.success} />
        <Text style={styles.printText}>{printing ? 'Creating…' : 'Print PDF'}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.printError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  printError: { color: palette.error, fontSize: 12, maxWidth: 160, marginTop: 6 },
  print: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.light,
    backgroundColor: palette.surface,
  },
  printPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  printLoading: { opacity: 0.45 },
  printText: { fontSize: 12, fontWeight: '800', color: palette.success },
});
