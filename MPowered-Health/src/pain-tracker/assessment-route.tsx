import { Redirect, useLocalSearchParams } from 'expo-router';
import { assessmentRoutes, resolveAssessmentId } from '@/pain-tracker/routes';

/**
 * Forwards old assessment links to the matching current assessment screen.
 *
 * Preserve existing assessment links while giving each area its own route.
 */
export default function LegacyAssessment() {
  const { type, ...params } = useLocalSearchParams<{
    type?: string;
    completed?: string;
    name?: string;
  }>();
  return <Redirect href={{ pathname: assessmentRoutes[resolveAssessmentId(type)], params }} />;
}
