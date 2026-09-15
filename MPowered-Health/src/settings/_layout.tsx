/** Sets up navigation and any shared providers for Settings. */
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'settings' };

/** Defines the route stack for Settings. */
export default function FeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
