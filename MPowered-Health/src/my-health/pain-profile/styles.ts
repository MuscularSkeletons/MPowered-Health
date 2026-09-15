/** Defines the colors, spacing, and layout used by My Health / pain profile. */
import { s as common } from '@/shared/forms/styles';
import { palette } from '@/shared/ui/mha-ui';
import { StyleSheet } from 'react-native';
export const s = {
  ...common,
  ...StyleSheet.create({
    profileSummaryContent: {
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 120,
    },
    profileSummaryHeader: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 10,
    },
    profileSummaryHeading: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      color: palette.text,
      flexShrink: 1,
    },
    profileSummaryUpdated: { fontSize: 12, color: palette.muted, marginTop: 4 },
    profileSummaryIntro: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.muted,
      marginTop: 6,
      marginBottom: 18,
    },
    profileSummaryCard: {
      backgroundColor: '#F3F1F7',
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
    },
    profileSummaryTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: palette.text },
    profileSummarySubtitle: { fontSize: 12, lineHeight: 18, color: palette.text, marginTop: 3 },
    profileSummaryRule: { height: 1, backgroundColor: '#D5CFDC', marginVertical: 10 },
    profileSummaryItem: { marginBottom: 12 },
    profileSummaryLabel: { fontSize: 11, lineHeight: 16, color: palette.muted, fontWeight: '600' },
    profileSummaryValue: { fontSize: 14, lineHeight: 20, color: palette.text, marginTop: 1 },
  }),
};
