import { Stack } from 'expo-router';

/** Groups public authentication, onboarding, and the post-registration activation screen. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="splashscreen" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="activation" />
    </Stack>
  );
}
