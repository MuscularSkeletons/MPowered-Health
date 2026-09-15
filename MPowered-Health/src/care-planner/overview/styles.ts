/** Defines the colors, spacing, and layout used by Care Planner / overview. */
import { palette } from '@/shared/ui/mha-ui';
import { StyleSheet } from 'react-native';
export const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 112,
  },
  cards: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
    marginTop: 32,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#F7F4FC',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 20,
  },
  appointments: {
    backgroundColor: '#F4F2F7',
    borderRadius: 22,
    padding: 20,
    marginTop: 32,
    gap: 16,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 2,
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: palette.muted,
    marginBottom: 18,
  },
  doctor: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  date: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 28,
  },
});
