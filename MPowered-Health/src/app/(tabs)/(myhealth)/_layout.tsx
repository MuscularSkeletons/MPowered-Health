import { Stack } from 'expo-router';

/** Keep prescription edits while navigating this tab; discard them when the account changes. */
export default function MyHealthLayout() {
  return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(prescriptions)" />
          <Stack.Screen name="painrecords" />
          <Stack.Screen name="profile" />
        </Stack>
  );
}
