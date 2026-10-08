import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}