export { default } from '@/features/auth/screens/OnboardingStepScreen';

export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}
