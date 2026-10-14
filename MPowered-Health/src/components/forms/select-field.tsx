import { palette, radius, spacing } from '@/constants/profile/ui';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
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
});
