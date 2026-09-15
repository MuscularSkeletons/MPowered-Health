/** Sets up navigation and any shared providers for Pain Tracker. */
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'dashboard' };

/** Defines the route stack for Pain Tracker. */
export default function FeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
