import { router, useLocalSearchParams } from 'expo-router';
export function useAppointmentNavigation() {
  const { fresh, resume } = useLocalSearchParams<{ fresh?: string; resume?: string }>();
  const params = { fresh, resume };
  return {
    questions: () => router.push({ pathname: '/appointment/questions', params }),
    review: () => router.push({ pathname: '/appointment/review', params }),
    details: () => router.replace({ pathname: '/appointment/details', params }),
    leave: () => router.replace('/care'),
  };
}
