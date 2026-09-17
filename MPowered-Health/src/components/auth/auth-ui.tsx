import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/profile/ui';

/** Displays the MPowered Health wordmark used throughout account setup. */
export function AuthHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoLockup}>
        <View style={styles.poweredMark}>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoPowered}>Powered</Text>
        </View>
        <Text style={styles.logoHealth}>Health</Text>
      </View>
    </View>
  );
}

/** Provides the shared background, header, scrolling, and keyboard behavior for auth screens. */
export function AuthScreen({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AuthHeader />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, compact && styles.compactContent]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Displays consistent page context before a form or onboarding question. */
export function AuthIntro({
  eyebrow,
  title,
  description,
  progress,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  progress?: string;
}) {
  return (
    <View style={styles.intro}>
      <View style={styles.introMeta}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : <View />}
        {progress ? <Text style={styles.progress}>{progress}</Text> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

/** Displays a labelled text field and an optional password visibility control. */
export function AuthInput({
  label,
  secure,
  reveal,
  onToggleReveal,
  ...props
}: TextInputProps & {
  label: string;
  secure?: boolean;
  reveal?: boolean;
  onToggleReveal?: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          secureTextEntry={secure && !reveal}
          placeholderTextColor={palette.muted}
          style={styles.input}
        />
        {secure && onToggleReveal ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? `Hide ${label}` : `Show ${label}`}
            hitSlop={12}
            onPress={onToggleReveal}
            style={styles.eyeButton}
          >
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={21} color={palette.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Displays the main action with a clear loading and disabled state. */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        (disabled || loading) && styles.primaryDisabled,
        pressed && styles.primaryPressed,
      ]}
    >
      <Text style={[styles.primaryText, (disabled || loading) && styles.primaryDisabledText]}>
        {loading ? 'Please wait…' : label}
      </Text>
    </Pressable>
  );
}

/** Displays one selectable answer with visible selected state. */
export function ChoiceButton({
  label,
  selected,
  multiple = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  multiple?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && styles.choicePressed,
      ]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
      <View style={[multiple ? styles.checkbox : styles.radio, selected && styles.choiceMark]}>
        {selected ? <Text style={styles.tick}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

export const authStyles = StyleSheet.create({
  actions: { gap: 10, marginTop: 28 },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: palette.primaryDark, fontSize: 13, fontWeight: '700' },
  helper: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  error: { color: palette.error, fontSize: 13, lineHeight: 20, marginTop: 12 },
  choices: { gap: 12, marginTop: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 12, color: palette.primaryDark, fontWeight: '700' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  keyboard: { flex: 1 },
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  logoLockup: { height: 34, flexDirection: 'row', alignItems: 'flex-end' },
  poweredMark: { width: 78, height: 34, position: 'relative' },
  logoM: { position: 'absolute', left: 0, bottom: 0, fontSize: 30, lineHeight: 33, fontWeight: '800', color: palette.text },
  logoPowered: { position: 'absolute', left: 25, top: 0, fontSize: 14, lineHeight: 16, fontWeight: '800', color: palette.text },
  logoHealth: { fontSize: 25, lineHeight: 30, fontWeight: '800', color: palette.success, marginLeft: 12 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  compactContent: { justifyContent: 'flex-start', paddingTop: 24, paddingBottom: 72 },
  intro: { marginBottom: 26 },
  introMeta: { minHeight: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, color: palette.primaryDark },
  progress: { fontSize: 11, fontWeight: '700', color: palette.muted },
  title: { marginTop: 8, fontSize: 29, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6, color: palette.text },
  description: { marginTop: 10, fontSize: 15, lineHeight: 23, color: palette.muted },
  field: { marginTop: 14 },
  label: { marginBottom: 7, fontSize: 12, fontWeight: '700', color: palette.text },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 15,
    color: palette.text,
  },
  eyeButton: { position: 'absolute', right: 5, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  primary: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  primaryDisabled: { backgroundColor: '#F3D6D1', shadowOpacity: 0, elevation: 0 },
  primaryDisabledText: { color: '#A47C76' },
  primaryPressed: { backgroundColor: palette.primaryDark, transform: [{ scale: 0.985 }] },
  primaryText: { color: palette.text, fontSize: 14, fontWeight: '800' },
  choice: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceSelected: { backgroundColor: '#EAF7FF', borderColor: palette.light },
  choicePressed: { opacity: 0.82 },
  choiceText: { flex: 1, paddingRight: 10, fontSize: 14, lineHeight: 20, color: palette.text },
  choiceTextSelected: { color: palette.primaryDark, fontWeight: '700' },
  radio: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.5, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  choiceMark: { backgroundColor: palette.primary, borderColor: palette.primary },
  tick: { color: palette.surface, fontSize: 12, fontWeight: '800' },
});
