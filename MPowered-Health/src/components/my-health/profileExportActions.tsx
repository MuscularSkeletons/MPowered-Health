import { copyText, printHtml, shareDocument } from '@/lib/documentExport';
import {
  type PainProfileReport,
  profileReportHtml,
  profileReportText,
} from '@/components/my-health/profileReport';
import { palette, radius, spacing } from '@/constants/ui/styling';
import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/** Prints and shares a My health profile report without allowing duplicate requests. */
export function ProfileExportActions({
  report,
  disabled,
}: {
  report: PainProfileReport;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState<'print' | 'share' | null>(null);
  const [error, setError] = useState('');
  const [shareText, setShareText] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const pending = useRef(false);

  const run = async (action: 'print' | 'share') => {
    if (disabled || pending.current) return;
    if (action === 'share' && Platform.OS === 'web') {
      setCopyStatus('');
      setShareText(profileReportText(report));
      return;
    }

    pending.current = true;
    setBusy(action);
    setError('');
    try {
      if (action === 'print') {
        await printHtml(profileReportHtml(report));
      } else {
        const result = await shareDocument({
          title: 'My health profile',
          html: profileReportHtml(report),
          text: profileReportText(report),
        });
        if (result === 'copy') setShareText(profileReportText(report));
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      if (!/cancel/i.test(message)) {
        setError(action === 'print' ? 'The PDF could not be opened.' : 'Your profile could not be shared.');
      }
    } finally {
      pending.current = false;
      setBusy(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        {(['print', 'share'] as const).map((action) => (
          <Pressable
            key={action}
            accessibilityRole="button"
            accessibilityLabel={action === 'print' ? 'Print My health profile PDF' : 'Share My health profile'}
            accessibilityState={{ disabled: disabled || !!busy, busy: busy === action }}
            disabled={disabled || !!busy}
            onPress={() => void run(action)}
            style={({ pressed }) => [
              styles.button,
              (disabled || !!busy) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Feather name={action === 'print' ? 'printer' : 'share-2'} size={16} color={palette.success} />
            <Text style={styles.buttonText}>
              {busy === action ? 'Opening…' : action === 'print' ? 'Print PDF' : 'Share'}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}

      <Modal visible={!!shareText} transparent animationType="fade" onRequestClose={() => setShareText('')}>
        <View style={styles.overlay}>
          <View style={styles.dialog} accessibilityViewIsModal>
            <Text style={styles.dialogTitle}>Share My health profile</Text>
            <Text style={styles.description}>Copy this summary into your preferred email or messaging app.</Text>
            <ScrollView style={styles.preview}>
              <Text selectable style={styles.summary}>{shareText}</Text>
            </ScrollView>
            {copyStatus ? <Text style={styles.description} accessibilityLiveRegion="polite">{copyStatus}</Text> : null}
            <View style={styles.dialogActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.dialogButton}
                onPress={async () => {
                  const copied = await copyText(shareText);
                  setCopyStatus(copied ? 'Copied. It is ready to paste.' : 'Select the summary above, then choose Copy.');
                }}
              >
                <Text style={styles.dialogButtonText}>Copy summary</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.dialogButton} onPress={() => setShareText('')}>
                <Text style={styles.dialogButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 1, maxWidth: '100%' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: {
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
  buttonText: { color: palette.success, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  error: { marginTop: spacing.sm, color: palette.error, fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    padding: spacing.xl,
    gap: spacing.md,
  },
  dialogTitle: { color: palette.text, fontSize: 21, fontWeight: '800' },
  description: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  preview: { flexShrink: 1, borderWidth: 1, borderColor: palette.light, borderRadius: radius.sm, padding: spacing.md },
  summary: { color: palette.text, fontSize: 13, lineHeight: 20 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: spacing.sm },
  dialogButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: spacing.lg },
  dialogButtonText: { color: palette.success, fontSize: 13, fontWeight: '800' },
});
