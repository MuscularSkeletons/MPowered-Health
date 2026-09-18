import { Alert, StyleSheet, Text, View } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { palette } from '@/constants/profile/ui';
import { AuthIntro, AuthScreen, PrimaryButton, authStyles } from '@/components/auth/auth-ui';

/** Introduces profile setup and links to the terms and privacy policy. */
export default function Onboarding() {
  const router = useRouter();

  /** Opens a policy without losing the current onboarding screen. */
  const openPolicy = async (url: string) => {
    try {
      await openBrowserAsync(url);
    } catch {
      Alert.alert('Unable to open page', 'Please try again.');
    }
  };

  return (
    <AuthScreen>
      <AuthIntro
        eyebrow="GET STARTED"
        title="Hello 👋🏻"
        description={
          'A few quick questions so we can make MPowered Health more relevant for you.'
        }
      />
      <Text style={styles.policy}>
        By continuing, you agree to MPowered’s{' '}
        <Text accessibilityRole="link" style={styles.link}
          onPress={() => void openPolicy('https://muscha.org/terms-and-conditions/')}>
          Terms and Conditions
        </Text>
        {' '}and{' '}
        <Text accessibilityRole="link" style={styles.link}
          onPress={() => void openPolicy('https://muscha.org/privacy-policy/')}>
          Privacy Policy
        </Text>.
      </Text>
      <View style={authStyles.actions}>
        <PrimaryButton label="Continue" onPress={() => router.push('/(auth)/(onboarding)/name')} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  policy: { fontSize: 15, lineHeight: 23, color: palette.muted },
  link: { color: palette.primaryDark, textDecorationLine: 'underline' },
});
