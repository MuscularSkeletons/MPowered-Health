/** Defines the colors, spacing, and layout used by Care Planner / saved appointments / appointment answers. */
import { palette } from '@/shared/ui/mha-ui';
import { StyleSheet } from 'react-native';
import { s as shared } from '@/care-planner/shared/styles';
export const s = {
  ...shared,
  ...StyleSheet.create({
    answerModalScroll: {
      maxHeight: '82%',
      borderRadius: 22,
      backgroundColor: '#fff',
    },
    answerEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: palette.primary,
      marginBottom: 8,
    },
    modalSecondary: {
      minHeight: 48,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSave: { flex: 1 },
    modalShade: {
      flex: 1,
      backgroundColor: 'rgba(32,26,43,.35)',
      justifyContent: 'center',
      padding: 18,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: 22,
      padding: 20,
      paddingBottom: 18,
    },
    modalQuestion: {
      fontSize: 16,
      lineHeight: 23,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 14,
    },
    answerInput: {
      minHeight: 220,
      maxHeight: 320,
      borderRadius: 14,
      backgroundColor: '#F4F2F7',
      padding: 14,
      fontSize: 14,
      color: palette.text,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 20,
    },
    cancel: { fontSize: 14, fontWeight: '700', color: palette.muted },
  }),
};
