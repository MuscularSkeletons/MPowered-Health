import { RegistrationProvider } from '@/auth/get-started/form-data/DraftProvider';
import { useRouteVisit } from '@/shared/navigation/useRouteVisit';
import { Stack } from 'expo-router';
export default function GetStartedLayout() {
  const { identity } = useRouteVisit('/get-started');
  return (
    <RegistrationProvider key={identity}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </RegistrationProvider>
  );
}
