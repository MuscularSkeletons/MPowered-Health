// This component lets the user print, share, or copy their pain profile.
import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette } from './mha-ui';
import { copyProfile, printProfile, shareProfile } from '@/utils/pain-profile-export';
import { PainProfileReport, profileReportText } from '@/utils/pain-profile-report';

// Coordinate print and share actions while preventing duplicate requests.
export function ProfileExportActions({
  report,
  disabled,
}: {
  report: PainProfileReport;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState<'print' | 'share' | null>(null);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [shareText, setShareText] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [sharingMore, setSharingMore] = useState(false);
  // Web sharing may show a preview before copy or system sharing.
  const run = async (action: 'print' | 'share') => {
    if (pending.current || disabled) return;
    if (action === 'share' && Platform.OS === 'web') {
      // Keep a usable copy option even in browsers whose system share sheet
      // is unavailable or never resolves (including embedded browsers).
      setCopyStatus('');
      setShareText(profileReportText(report));
      return;
    }
    pending.current = true;
    setBusy(action);
    setError('');
    try {
      if (action === 'print') await printProfile(report);
      else if ((await shareProfile(report)) === 'copy') {
        setCopyStatus('');
        setShareText(profileReportText(report));
      }
    } catch (cause) {
      // Cancelling a system print/share dialog is not an export failure.
      const message = cause instanceof Error ? cause.message : '';
      if (!/cancel/i.test(message))
        setError(
          `Could not ${action === 'print' ? 'open the print dialog' : 'share your profile'}. Please try again.`,
        );
    } finally {
      pending.current = false;
      setBusy(null);
    }
  };
  return (
    <View style={s.container}>
      <View style={s.actions}>
        {(['print', 'share'] as const).map((action) => (
          <Pressable
            key={action}
            accessibilityRole="button"
            accessibilityLabel={
              action === 'print' ? 'Print My Pain Profile PDF' : 'Share My Pain Profile'
            }
            accessibilityState={{ disabled: disabled || !!busy, busy: busy === action }}
            disabled={disabled || !!busy}
            onPress={() => void run(action)}
            style={({ pressed }) => [
              s.button,
              (disabled || !!busy) && s.disabled,
              pressed && s.pressed,
            ]}
          >
            <Feather
              name={action === 'print' ? 'printer' : 'share-2'}
              size={16}
              color={palette.primary}
            />
            <Text style={s.buttonText}>
              {busy === action ? 'Opening…' : action === 'print' ? 'Print PDF' : 'Share'}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      <Modal
        visible={!!shareText}
        transparent
        animationType="fade"
        onRequestClose={() => setShareText('')}
      >
        <View style={s.overlay}>
          <View style={s.dialog} accessibilityViewIsModal>
            <Text style={s.title} accessibilityRole="header">
              Share My Pain Profile
            </Text>
            <Text style={s.description}>
              Copy this summary and paste it into your preferred email or messaging app.
            </Text>
            <ScrollView style={s.preview}>
              <Text selectable style={s.summary}>
                {shareText}
              </Text>
            </ScrollView>
            {copyStatus ? (
              <Text accessibilityLiveRegion="polite" style={s.description}>
                {copyStatus}
              </Text>
            ) : null}
            <View style={s.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={sharingMore}
                style={[s.button, sharingMore && s.disabled]}
                onPress={async () => {
                  setSharingMore(true);
                  try {
                    if ((await shareProfile(report)) === 'copy') {
                      setCopyStatus('Use Copy summary to share from this browser.');
                    }
                  } finally {
                    setSharingMore(false);
                  }
                }}
              >
                <Text style={s.buttonText}>
                  {sharingMore ? 'Opening…' : 'More sharing options'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={s.button}
                onPress={async () => {
                  const copied = await copyProfile(shareText);
                  setCopyStatus(
                    copied
                      ? 'Copied. Paste it into your email or message.'
                      : 'Select the summary above, then choose Copy.',
                  );
                }}
              >
                <Text style={s.buttonText}>Copy summary</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={s.button}
                onPress={() => setShareText('')}
              >
                <Text style={s.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Group export buttons, messages, and preview-modal styles below.
const s = StyleSheet.create({
  container: { flexShrink: 1, maxWidth: '100%', marginLeft: 'auto' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3EEFF',
    borderWidth: 1,
    borderColor: '#D8C8F8',
    borderRadius: 10,
  },
  buttonText: { fontSize: 13, fontWeight: '700', color: palette.primary },
  disabled: { opacity: 0.5 },
  pressed: { backgroundColor: '#E5D9FA' },
  error: { color: '#A52035', fontSize: 13, marginTop: 8, maxWidth: 300 },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 18,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  description: { fontSize: 14, lineHeight: 21, color: palette.text },
  preview: { flexShrink: 1, borderWidth: 1, borderColor: '#D5CFDC', padding: 12, borderRadius: 8 },
  summary: { fontSize: 14, lineHeight: 22, color: palette.text },
});
