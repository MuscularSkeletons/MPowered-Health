/** Sets up navigation and any shared providers for Care Planner. */
import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'care' };

/** Defines the Care Planner stack and its initial overview route. */
export default function CarePlannerLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
