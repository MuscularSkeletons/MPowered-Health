import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { diagnosisOptions } from '@/constants/profile/profile-options';
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

/** Stores whether the user has a formal diagnosis. */
export default function StoreDiagnosis() {
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | null>(null);
  const router = useRouter();
  const { user, updateUserDraft } = useAuth();

  const handleComplete = () => {
    if (hasDiagnosis === null) {
      Alert.alert('Error', 'Please select an option');
      return;
    }
    if (!user) throw new Error('User not authenticated');
    updateUserDraft({ formalDiagnosis: hasDiagnosis });
    router.push('/(auth)/(onboarding)/conditions');
  };

  return (
    <AuthScreen compact>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="YOUR PROFILE"
        progress="4 of 6"
        title="Do you have a musculoskeletal or chronic pain diagnosis from your doctor?"
        description="For example, arthritis, back pain, or gout. No diagnosis? No problem—you know your body and how you feel."
      />
      <View style={authStyles.choices}>
        <ChoiceButton
          label={diagnosisOptions[0]}
          selected={hasDiagnosis === true}
          onPress={() => setHasDiagnosis(true)}
        />
        <ChoiceButton
          label={diagnosisOptions[1]}
          selected={hasDiagnosis === false}
          onPress={() => setHasDiagnosis(false)}
        />
      </View>
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" disabled={hasDiagnosis === null} onPress={handleComplete} />
      </View>
    </AuthScreen>
  );
}
