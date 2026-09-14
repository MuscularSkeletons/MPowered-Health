import { AccountBoundary } from '@/shared/account/AccountBoundary';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function RootLayout() {
  return (
    <AccountBoundary>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </AccountBoundary>
  );
}
