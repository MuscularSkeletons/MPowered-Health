import AppointmentReviewScreen from '@/features/care-planner/consultation/screen';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function ReviewEntry() {
  const params = useLocalSearchParams<{ mode?: string }>();
  return params.mode === 'plan' ? (
    <Redirect href={{ pathname: '/appointment/review', params: { ...params, resume: 'legacy' } }} />
  ) : (
    <AppointmentReviewScreen />
  );
}
