import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

/** Stores the name used to personalise the profile. */
export default function StoreName() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();

  const handleComplete = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!user) throw new Error('User not authenticated');
    updateUserDraft({ name: trimmedName });
    router.push('/(auth)/(onboarding)/birthsex');
  };

  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="YOUR PROFILE"
        progress="1 of 6"
        title="Your name"
        description="Your health and wellbeing are uniquely you. Your name helps us address you personally."
      />
      <AuthInput
        label="Name"
        placeholder="Type your name"
        inputMode="text"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleComplete}
      />
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" disabled={!name.trim()} onPress={handleComplete} />
      </View>
    </AuthScreen>
  );
}
