import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader, PrimaryButton } from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';
import { saveWeeklyReflection } from '@/hooks/useAssessments';

interface WeeklyReflectionScreenProps {
  initialText?: string;
  onBack: () => void;
  onSaved: (savedText: string) => void;
}

export default function WeeklyReflectionScreen({
  initialText = '',
  onBack,
  onSaved,
}: WeeklyReflectionScreenProps) {
  const [reflection, setReflection] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await saveWeeklyReflection(reflection.trim());
      onSaved(reflection.trim());
      Alert.alert('Saved', 'Your reflection has been recorded for this week.', [
        { text: 'Done', onPress: onBack },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save your reflection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AuthHeader />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header */}
          <View style={styles.top}>
            <Pressable onPress={onBack}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
          </View>

          <Text style={styles.module}>Weekly Check-in</Text>
          <Text style={styles.title}>Weekly Reflection</Text>
          <Text style={styles.prompt}>
            Write any notes, highlights, triggers, or thoughts about how your body felt this week.
          </Text>

          {/* Reflection TextArea */}
          <TextInput
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={6}
            placeholder="e.g. Walking felt easier after physio on Tuesday, but sitting for long periods during work caused mid-back stiffness..."
            placeholderTextColor="#81798A"
            style={styles.textArea}
            autoFocus
          />

          <View style={styles.action}>
            <PrimaryButton
              label={isSubmitting ? 'Saving…' : 'Save Reflection'}
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSave}
            />
          </View>

          <Text style={styles.helper}>
            This reflection is completely optional and will be attached to your weekly health record.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  body: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  optionalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  module: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  action: {
    marginBottom: 16,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
  },
});