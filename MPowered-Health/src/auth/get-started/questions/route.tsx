export { default } from '@/auth/get-started/questions/screen';

export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}
