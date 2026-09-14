import { MedicationProvider } from '@/my-health/prescriptions/state/StoreProvider';
import { Stack } from 'expo-router';
export default function MedicationLayout() {
  return (
    <MedicationProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MedicationProvider>
  );
}
