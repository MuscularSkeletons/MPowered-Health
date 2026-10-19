// contains UI components for form including input and drop down menus. Currently used by prescriptions feature
import { palette, radius, spacing } from '@/constants/ui/styling';
import { 
    StyleSheet,
    Text, 
    TextInput, 
    View,
    Pressable,
    Modal,
} from 'react-native';
import { 
    Screen, 
    Intro,
    commonStyles,
} from '@/components/ui/common';
import { router } from 'expo-router';
import { useState } from 'react';

/** Wraps a form in the shared page layout and back navigation. */
export function Shell({
  title,
  children,
  onBack = () => router.back(),
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <Screen>
        <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
        <Intro
            sectionLabel="PRESCRIPTIONS"
            title={title}
        />
        {children}
    </Screen>
  );
}

/** Displays a labeled form input for either numeric and text values. */
export function Field({
  label,
  value,
  set,
  error,
  editable = true,
  input = 'text',
  multiline = false,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  error?: string;
  editable?: boolean;
  input?: 'text' | 'decimal';
  multiline?: boolean;
}) {

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={(text) => set(text)}
        accessibilityLabel={label}
        autoCapitalize={'sentences'}
        keyboardType={input === 'decimal' ? 'decimal-pad' : 'default'}
        inputMode={input === 'decimal' ? 'decimal' : 'text'}
        placeholder={label}
        placeholderTextColor={palette.muted}
        style={[
          styles.input,
          multiline
            ? {
                minHeight: 130,
              }
            : null,
        ]}
        multiline={multiline}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Displays one compact form value and opens its available options in a modal sheet. */
export function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              {label}
            </Text>
            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={[styles.option, selected && styles.selected]}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.selectedText]}>{option}</Text>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* button to add and save prescriptions */
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
      style={({ pressed }) => [styles.action, disabled && styles.disabled, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.actionText, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  fieldError: { color: palette.error, fontSize: 12, marginTop: 6 },
  input: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 15,
    color: palette.text,
    textAlignVertical: 'top',
  },
  field: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, fontSize: 14, fontWeight: '700', color: palette.text },
  control: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.controlBorder,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: { backgroundColor: palette.pressedBackground },
  value: { fontSize: 15, color: palette.text },
  chevron: { fontSize: 18, color: palette.muted },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: '#00000066',
  },
  sheet: {
    borderRadius: radius.xl,
    backgroundColor: palette.surface,
    padding: spacing.lg,
  },
  sheetTitle: { marginBottom: spacing.md, fontSize: 18, fontWeight: '800', color: palette.text },
  option: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selected: { backgroundColor: palette.selectionBackground },
  optionText: { fontSize: 15, color: palette.text },
  selectedText: { fontWeight: '700', color: palette.success },
  check: { fontSize: 16, fontWeight: '800', color: palette.success },
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
  buttonPressed: {
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