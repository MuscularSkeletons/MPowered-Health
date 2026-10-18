/** Defines the colors, spacing, and layout used by My Health / prescriptions / prescription list. */
import { palette } from '@/constants/profile/ui';
import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginVertical: 18,
  },
  med: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: palette.text,
  },
  copy: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
    marginTop: 10,
    marginBottom: 16,
  },
});
