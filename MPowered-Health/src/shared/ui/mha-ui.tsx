/** Provides the headers, buttons, cards, and summary rows reused across the app. */
import { Pressable, StyleSheet, Text, View } from 'react-native';
// Shared design values keep screens visually consistent and avoid repeated numbers.
export const palette = {
  primary: '#5E17EB',
  secondary: '#8C52FF',
  accent: '#BEA1F7',
  light: '#D8C7FA',
  primaryDark: '#4610B8',
  text: '#201A2B',
  muted: '#686173',
  background: '#F9F8FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F4FC',
  line: '#E5DFF0',
  success: '#257A57',
  error: '#A64259',
};
/**
 * Displays the shared MPowered header.
 *
 * Render the shared MPowered Health wordmark at the top of screens.
 */
export function MhaHeader() {
  return (
    <View style={s.header}>
      <View style={s.logoLockup}>
        <View style={s.poweredMark}>
          <Text style={s.centerM}>M</Text>
          <Text style={s.centerPowered}>Powered</Text>
        </View>
        <Text style={s.centerHealth}>Health</Text>
      </View>
    </View>
  );
}

/**
 * Displays a styled action button with optional disabled state.
 *
 * Keep primary actions consistent and expose disabled state for accessibility.
 */
export function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.action, disabled && s.disabled, pressed && s.pressed]}
    >
      <Text style={[s.actionText, disabled && s.disabledText]}>{label}</Text>
    </Pressable>
  );
}

// Store shared component styles after behavior and content rules.
const s = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: '#E9E4F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#2F174A',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  logoLockup: { height: 34, flexDirection: 'row', alignItems: 'flex-end' },
  poweredMark: { width: 78, height: 34, position: 'relative' },
  centerM: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '800',
    color: '#18151C',
  },
  centerPowered: {
    position: 'absolute',
    left: 25,
    top: 0,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
    color: '#18151C',
  },
  centerHealth: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#8C52FF',
    marginLeft: 12,
  },
  action: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#5E17EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#4610B8',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#4610B8',
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
  disabled: { backgroundColor: '#D8C7FA', shadowOpacity: 0, elevation: 0 },
  disabledText: { color: '#5E17EB' },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
