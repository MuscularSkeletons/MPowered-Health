/** Sets up navigation and any shared providers for account setup / Get Started. */
import { RegistrationProvider } from '@/auth/get-started/form-data/DraftProvider';
import { useRouteVisit } from '@/shared/navigation/useRouteVisit';
import { Stack } from 'expo-router';

/** Wraps the Get Started routes in a shared registration draft for the current visit. */
export default function GetStartedLayout() {
  const { identity } = useRouteVisit('/get-started');
  return (
    <RegistrationProvider key={identity}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </RegistrationProvider>
  );
}
