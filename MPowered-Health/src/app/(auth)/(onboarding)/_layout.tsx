import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'onboarding',
}

/** Keeps onboarding routes together while each screen renders the shared header */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
    <Stack.Screen name="onboarding" />
    <Stack.Screen name="name" />
    <Stack.Screen name="birthsex" />
    <Stack.Screen name="birthyear" />
    <Stack.Screen name="diagnosis" />
    <Stack.Screen name="conditions" />
    <Stack.Screen name="miscconditions" />
    <Stack.Screen name="completed" />
  </Stack>;
}
