import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { sexOptions } from '@/constants/profile/profileOptions';
import {
  Intro,
  Screen,
  ChoiceButton,
  PrimaryButton,
  commonStyles,
} from '@/components/shared/common';

/** Stores the selected birth sex locally. */
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
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <Intro
        sectionLabel="YOUR PROFILE"
        progress="2 of 6"
        title="Your sex"
        description="Research shows that people may experience pain differently depending on their sex."
      />
      <View style={commonStyles.choices}>
        {sexOptions.map((option) => (
          <ChoiceButton
            key={option}
            label={option}
            selected={birthsex === option}
            onPress={() => setBirthSex(option)}
          />
        ))}
      </View>
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" disabled={!birthsex} onPress={handleComplete} />
      </View>
    </Screen>
  );
}
