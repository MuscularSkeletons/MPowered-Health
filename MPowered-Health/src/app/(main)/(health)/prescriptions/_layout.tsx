import { MedicationProvider } from '@/features/medications/state/MedicationProvider';
import { Stack } from 'expo-router';
export default function MedicationLayout() {
  return (
    <MedicationProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MedicationProvider>
  );
}
