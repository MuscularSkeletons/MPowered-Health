/** Sets up navigation and any shared providers for My Health. */
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'explore' };

/** Defines the route stack for My Health. */
export default function FeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
