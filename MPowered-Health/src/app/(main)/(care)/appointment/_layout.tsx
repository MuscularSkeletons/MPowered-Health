import { restoreAppointmentDraft } from '@/features/appointments/models/appointment-draft';
import { AppointmentDraftProvider } from '@/features/appointments/state/AppointmentDraftProvider';
import { useRouteVisit } from '@/shared/navigation/useRouteVisit';
import { Stack } from 'expo-router';
export default function AppointmentLayout() {
  const { identity, params } = useRouteVisit('/appointment');
  return (
    <AppointmentDraftProvider key={identity} initial={restoreAppointmentDraft(params)}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </AppointmentDraftProvider>
  );
}
