import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton, Screen, Intro, commonStyles, } from '@/components/shared/common';
import { palette } from '@/constants/ui/styling';
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
    <Screen>
      {/* Top Header */}
      <View style={styles.top}>
        <Text onPress={onBack} style={commonStyles.back}>‹ Back</Text>
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalText}>Optional</Text>
        </View>
      </View>

      <Intro
        sectionLabel="WEEKLY CHECK-IN"
        title="Weekly Reflection"
        description="Write any notes, highlights, triggers, or thoughts about how your body felt this week."
      />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionalBadge: {
    backgroundColor: palette.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.muted,
    textTransform: 'uppercase',
  },
  textArea: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
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
    color: palette.disabledText,
    textAlign: 'center',
  },
});