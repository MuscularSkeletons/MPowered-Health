import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import {
  Input,
  Intro,
  Screen,
  PrimaryButton,
  commonStyles,
} from '@/components/shared/common';

/** Stores other miscellaneous conditions if the question is not skipped */
export default function StoreOtherConditions() {
  const [otherCondition, setOtherCondition] = useState('');
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();
  const finish = () => router.push('/(auth)/(onboarding)/completed');

  const handleComplete = () => {
    if (!user) throw new Error('User not authenticated');
    updateUserDraft({ otherCondition: otherCondition.trim() });
    finish();
  };

  return (
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <Intro
        sectionLabel="YOUR PROFILE"
        progress="6 of 6"
        title="Do you have any other conditions?"
        description="Add any other conditions or symptoms you know about. This question is optional."
      />
      <Input
        label="Other conditions"
        placeholder="Type conditions or symptoms"
        inputMode="text"
        autoCorrect
        value={otherCondition}
        onChangeText={setOtherCondition}
        onSubmitEditing={handleComplete}
      />
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" disabled={!otherCondition.trim()} onPress={handleComplete} />
        <Pressable accessibilityRole="button" onPress={finish} style={commonStyles.secondaryAction}>
          <Text style={commonStyles.secondaryText}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
