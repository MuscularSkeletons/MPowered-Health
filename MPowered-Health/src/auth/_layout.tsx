/** Sets up navigation and any shared providers for account setup. */
import { Stack } from 'expo-router';

/** Defines the authentication route stack. */
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
