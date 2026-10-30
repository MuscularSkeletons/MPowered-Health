import { Stack } from 'expo-router';

/** Keeps onboarding routes together while each screen renders the shared header */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
