/** Lists the question steps that Expo should include when building the app. */
export { default } from '@/auth/get-started/questions/screen';

/** Lists the question steps that Expo should include when building the app. */
export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}
