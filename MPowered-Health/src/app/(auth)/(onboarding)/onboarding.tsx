import { Alert, StyleSheet, Text, View } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { palette } from '@/constants/ui/styling';
import { Intro, Screen, PrimaryButton, commonStyles } from '@/components/shared/common';

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
    <Screen>
      <Intro
        sectionLabel="GET STARTED"
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
      <View style={commonStyles.actions}>
        <PrimaryButton label="Continue" onPress={() => router.push('/(auth)/(onboarding)/name')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  policy: { fontSize: 15, lineHeight: 23, color: palette.muted },
  link: { color: palette.primary, textDecorationLine: 'underline' },
});
