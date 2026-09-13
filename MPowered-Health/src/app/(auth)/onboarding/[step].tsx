export { default } from '@/features/auth/onboarding/screen';

export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}
