import { HealthSessionBoundary } from '@/my-health/SessionBoundary';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { MedicationProvider } from '@/my-health/prescriptions/state/StoreProvider';

/** Keep prescription edits while navigating this tab; discard them when the account changes. */
export default function MyHealthLayout() {
  const { user } = useAuth();
  return (
    <HealthSessionBoundary key={user?.id ?? 'signed-out'} userId={user?.id ?? 'signed-out'}>
      <MedicationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </MedicationProvider>
    </HealthSessionBoundary>
  );
}
