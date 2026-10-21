import { Stack } from 'expo-router';

/** Specifies stack for prescription feature */
export default function PrescriptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}