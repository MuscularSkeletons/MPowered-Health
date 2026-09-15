/** Sets up navigation and any shared providers for My Health / prescriptions. */
import { MedicationProvider } from '@/my-health/prescriptions/state/StoreProvider';
import { Stack } from 'expo-router';

/** Shares the prescription store across the list and editor routes. */
export default function MedicationLayout() {
  return (
    <MedicationProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MedicationProvider>
  );
}
