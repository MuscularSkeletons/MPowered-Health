import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'explore' };
export default function FeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
