import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { BIRTH_YEAR_RANGE } from '@/constants/profile/profileConstants';
import {
  Input,
  Intro,
  Screen,
  PrimaryButton,
  commonStyles,
} from '@/components/shared/common';

/** Stores an optional birth year after checking the allowed range */
export default function StoreBirthYear() {
  const [birthYear, setBirthYear] = useState('');
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();

  const continueToDiagnosis = () => router.push('/(auth)/(onboarding)/diagnosis');
  const handleComplete = () => {
    const numericBirthYear = Number(birthYear);
    if (
      !/^\d{4}$/.test(birthYear) ||
      numericBirthYear < BIRTH_YEAR_RANGE.LOWER_BOUND ||
      numericBirthYear > BIRTH_YEAR_RANGE.UPPER_BOUND
    ) {
      Alert.alert('Error', 'Please enter a valid four-digit year');
      return;
    }
    if (!user) throw new Error('User not authenticated');
    updateUserDraft({ birthyear: numericBirthYear });
    continueToDiagnosis();
  };

  return (
    <Screen>
      <Text onPress={() => router.back()} style={commonStyles.back}>‹ Back</Text>
      <Intro
        sectionLabel="YOUR PROFILE"
        progress="3 of 6"
        title="Your year of birth"
        description="Research shows that people can feel pain differently depending on their age. This question is optional."
      />
      <Input
        label="Year of birth"
        placeholder="YYYY"
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={4}
        value={birthYear}
        onChangeText={(value) => setBirthYear(value.replace(/\D/g, '').slice(0, 4))}
        onSubmitEditing={handleComplete}
      />
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" disabled={birthYear.length !== 4} onPress={handleComplete} />
        <Pressable accessibilityRole="button" onPress={continueToDiagnosis} style={commonStyles.secondaryAction}>
          <Text style={commonStyles.secondaryText}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
