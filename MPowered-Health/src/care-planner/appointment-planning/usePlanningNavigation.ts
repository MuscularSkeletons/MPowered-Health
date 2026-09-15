/** Moves between planning steps while keeping the visit parameters. */
import { router, useLocalSearchParams } from 'expo-router';

/** Moves between planning steps while keeping the visit parameters. */
export function usePlanningNavigation() {
  const { fresh, resume } = useLocalSearchParams<{ fresh?: string; resume?: string }>();
  const params = { fresh, resume };
  return {
    questions: () => router.push({ pathname: '/appointment/questions', params }),
    review: () => router.push({ pathname: '/appointment/review', params }),
    details: () => router.replace({ pathname: '/appointment/details', params }),
    leave: () => router.replace('/care'),
  };
}
