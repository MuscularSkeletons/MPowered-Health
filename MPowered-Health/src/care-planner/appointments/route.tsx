import AppointmentScreen from '@/care-planner/appointments/screen';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function AppointmentEntry() {
  const params = useLocalSearchParams<{ mode?: string }>();
  return params.mode === 'plan' ? (
    <Redirect href={{ pathname: '/appointment/review', params: { ...params, resume: 'legacy' } }} />
  ) : (
    <AppointmentScreen />
  );
}
