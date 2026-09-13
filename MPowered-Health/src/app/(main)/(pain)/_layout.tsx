import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'dashboard' };
export default function FeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
