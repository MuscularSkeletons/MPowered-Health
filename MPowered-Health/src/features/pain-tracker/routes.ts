import type { AssessmentId } from '@/features/pain-tracker/shared/assessment/types';
export const assessmentRoutes = {
  pain: '/my-pain',
  movement: '/my-movement',
  personal: '/my-personal-care',
  social: '/my-social-health',
  management: '/my-management',
} as const satisfies Record<AssessmentId, string>;
export function resolveAssessmentId(value?: string): AssessmentId {
  return value && Object.hasOwn(assessmentRoutes, value) ? (value as AssessmentId) : 'pain';
}
