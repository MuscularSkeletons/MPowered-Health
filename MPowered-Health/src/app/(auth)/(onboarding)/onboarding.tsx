import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthIntro, AuthScreen, PrimaryButton, authStyles } from '@/components/auth/auth-ui';

/** Introduces profile setup before the existing backend onboarding questions begin. */
export default function Onboarding() {
  const router = useRouter();
  return (
    <AuthScreen>
      <AuthIntro
        eyebrow="GET STARTED"
        title="Hello 👋🏻"
        description={
          'A few quick questions so we can make MPowered Health more relevant for you.\n\nBy continuing, you agree to MPowered’s Terms and Conditions and Privacy Policy.'
        }
      />
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" onPress={() => router.push('/(auth)/(onboarding)/name')} />
      </View>
    </AuthScreen>
  );
}
