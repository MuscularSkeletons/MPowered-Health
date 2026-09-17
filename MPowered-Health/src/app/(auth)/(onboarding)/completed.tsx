import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '@/context/authcontext';
import { AuthIntro, AuthScreen, PrimaryButton, authStyles } from '@/components/auth/auth-ui';

/** Saves the same backend profile fields, then leaves onboarding through its completion route. */
export default function CompleteOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      await updateUser({
        name: user.name,
        birthsex: user.birthsex,
        birthyear: user.birthyear,
        formalDiagnosis: user.formalDiagnosis,
        painConditions: user.painConditions,
        otherCondition: user.otherCondition,
        onboardingComplete: true,
      });
      // The session guard opens activation when the saved profile becomes complete.
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen>
      <AuthIntro
        eyebrow="PROFILE COMPLETE"
        title={`Thank you${user?.name ? `, ${user.name}` : ''} 😃`}
        description="Your answers are ready to be linked to your account."
      />
      <Text style={authStyles.helper}>
        Continue to finish setup and prepare your MPowered Health experience.
      </Text>
      <View style={authStyles.actions}>
        <PrimaryButton label="Finish setup" loading={isLoading} onPress={() => void handleComplete()} />
      </View>
    </AuthScreen>
  );
}
