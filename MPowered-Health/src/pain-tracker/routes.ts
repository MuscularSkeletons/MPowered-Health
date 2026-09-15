/** Maps assessment names to routes and handles unknown assessment names. */
import type { AssessmentId } from '@/shared/health-records/assessment-types';
export const assessmentRoutes = {
  pain: '/my-pain',
  movement: '/my-movement',
  personal: '/my-personal-care',
  social: '/my-social-health',
  management: '/my-management',
} as const satisfies Record<AssessmentId, string>;

/** Accepts known assessment names and chooses a safe default for unknown values. */
export function resolveAssessmentId(value?: string): AssessmentId {
  return value && Object.hasOwn(assessmentRoutes, value) ? (value as AssessmentId) : 'pain';
}
