import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from './mha-ui';
import { NavGlyph } from './nav-icon';

function Item({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: 'clipboard' | 'settings';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [s.item, pressed && s.pressed]}
    >
      <View style={[s.iconPill, active && s.iconPillActive]}>
        <NavGlyph name={icon} color={active ? palette.primary : '#6B5C7A'} filled={active} />
      </View>
      <Text style={[s.label, active && s.labelActive]}>{label}</Text>
    </Pressable>
  );
}
export function SupportTabs({ active }: { active: 'care' | 'setting' }) {
  return (
    <View style={s.bar}>
      <Item
        active={active === 'care'}
        label="Care Planner"
        icon="clipboard"
        onPress={() => router.replace('/support-home')}
      />
      <Item
        active={active === 'setting'}
        label="Settings"
        icon="settings"
        onPress={() => router.replace('/support-setting')}
      />
    </View>
  );
}
const s = StyleSheet.create({
  bar: {
    height: 88,
    borderTopWidth: 1,
    borderTopColor: '#ECE7F3',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 9,
    shadowColor: '#32165C',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 1,
  },
  pressed: { backgroundColor: '#F7F4FC' },
  iconPill: {
    width: 58,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: '#D8C7FA' },
  label: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0,
    color: '#6B5C7A',
    marginTop: 4,
  },
  labelActive: { color: palette.primary },
});
