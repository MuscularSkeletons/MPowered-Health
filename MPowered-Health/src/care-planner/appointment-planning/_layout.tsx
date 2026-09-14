import { restoreAppointmentDraft } from '@/care-planner/appointment-planning/appointment-draft/draft';
import { AppointmentDraftProvider } from '@/care-planner/appointment-planning/appointment-draft/DraftProvider';
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
