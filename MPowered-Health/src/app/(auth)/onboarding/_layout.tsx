import { RegistrationProvider } from '@/features/auth/onboarding/state/DraftProvider';
import { useRouteVisit } from '@/shared/navigation/useRouteVisit';
import { Stack } from 'expo-router';
export default function OnboardingLayout() {
  const { identity } = useRouteVisit('/onboarding');
  return (
    <RegistrationProvider key={identity}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </RegistrationProvider>
  );
}
