import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

/** Collects or skips other conditions without changing the backend's profile shape. */
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
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        eyebrow="YOUR PROFILE"
        progress="6 of 6"
        title="Do you have any other conditions?"
        description="Add any other conditions or symptoms you know about. This question is optional."
      />
      <AuthInput
        label="Other conditions"
        placeholder="Type conditions or symptoms"
        inputMode="text"
        autoCorrect
        value={otherCondition}
        onChangeText={setOtherCondition}
        onSubmitEditing={handleComplete}
      />
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" disabled={!otherCondition.trim()} onPress={handleComplete} />
        <Pressable accessibilityRole="button" onPress={finish} style={authStyles.secondaryAction}>
          <Text style={authStyles.secondaryText}>Skip</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
