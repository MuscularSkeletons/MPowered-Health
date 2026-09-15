/** Sets up navigation and any shared providers for Care Planner / appointment planning. */
import { restoreAppointmentDraft } from '@/care-planner/appointment-planning/appointment-draft/draft';
import { AppointmentDraftProvider } from '@/care-planner/appointment-planning/appointment-draft/DraftProvider';
import { useRouteVisit } from '@/shared/navigation/useRouteVisit';
import { Stack } from 'expo-router';

/** Shares the appointment draft across the planning routes for one visit. */
export default function AppointmentLayout() {
  // A new visit key resets the draft; moving between steps keeps the same provider.
  const { identity, params } = useRouteVisit('/appointment');
  return (
    <AppointmentDraftProvider key={identity} initial={restoreAppointmentDraft(params)}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </AppointmentDraftProvider>
  );
}
