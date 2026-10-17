/** Provides the header and action button shared by My Health screens. */
import { palette, radius } from '@/constants/profile/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

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
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    shadowColor: palette.text,
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
    color: palette.text,
  },
  centerPowered: {
    position: 'absolute',
    left: 25,
    top: 0,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
    color: palette.text,
  },
  centerHealth: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: palette.primary,
    marginLeft: 12,
  },
  action: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: palette.success,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  pressed: {
    backgroundColor: palette.success,
    opacity: 0.84,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
  disabled: { backgroundColor: palette.surfaceSoft, shadowOpacity: 0, elevation: 0 },
  disabledText: { color: palette.muted },
  actionText: {
    color: palette.surface,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
