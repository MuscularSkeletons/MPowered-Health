import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { sexOptions } from '@/constants/profile/profile-options';
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

/** Collects the selected sex while retaining the existing onboarding data shape. */
export default function StoreBirthSex() {
  const [birthsex, setBirthSex] = useState('');
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();

  const handleComplete = () => {
    if (!birthsex) {
      Alert.alert('Error', 'Please select an option');
      return;
    }
    if (!user) throw new Error('User not authenticated');
    updateUserDraft({ birthsex });
    router.push('/(auth)/(onboarding)/birthyear');
  };

  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        eyebrow="YOUR PROFILE"
        progress="2 of 6"
        title="Your sex"
        description="Research shows that people may experience pain differently depending on their sex."
      />
      <View style={authStyles.choices}>
        {sexOptions.map((option) => (
          <ChoiceButton
            key={option}
            label={option}
            selected={birthsex === option}
            onPress={() => setBirthSex(option)}
          />
        ))}
      </View>
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" disabled={!birthsex} onPress={handleComplete} />
      </View>
    </AuthScreen>
  );
}
