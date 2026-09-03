import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Only support-person routes exist in this branch; their screens render SupportTabs.
export default function SupportLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
