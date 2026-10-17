import { HealthDataBoundary } from '@/components/my-health/health-data-boundary';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { MedicationProvider } from '@/context/prescriptions-context';

/** Keep prescription edits while navigating this tab; discard them when the account changes. */
export default function MyHealthLayout() {
  const { user } = useAuth();
  return (
    <HealthDataBoundary key={user?.id ?? 'signed-out'} userId={user?.id ?? 'signed-out'}>
      <MedicationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(prescriptions)" />
          <Stack.Screen name="health-records" />
          <Stack.Screen name="profile" />
        </Stack>
      </MedicationProvider>
    </HealthDataBoundary>
  );
}
