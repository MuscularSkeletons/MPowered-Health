import { StyleSheet } from 'react-native';
export const s = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#ECE7F3',
    borderTopWidth: 1,
    height: 88,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 14,
    shadowColor: '#32165C',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 1,
    paddingVertical: 1,
  },
  tabLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 4,
  },
  iconPill: {
    width: 58,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: '#D8C7FA' },
});
