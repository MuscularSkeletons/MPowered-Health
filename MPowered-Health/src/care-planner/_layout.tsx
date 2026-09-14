import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'care' };
export default function CarePlannerLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
