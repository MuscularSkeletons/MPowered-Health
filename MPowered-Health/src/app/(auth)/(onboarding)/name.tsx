import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import {
  Input,
  Intro,
  Screen,
  PrimaryButton,
  commonStyles,
} from '@/components/shared/common';

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
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <Intro
        sectionLabel="YOUR PROFILE"
        progress="1 of 6"
        title="Your name"
        description="Your health and wellbeing are uniquely you. Your name helps us address you personally."
      />
      <Input
        label="Name"
        placeholder="Type your name"
        inputMode="text"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleComplete}
      />
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" disabled={!name.trim()} onPress={handleComplete} />
      </View>
    </Screen>
  );
}
