import { Redirect, useLocalSearchParams } from 'expo-router';
export default function LegacyRoute() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/onboarding/[step]', params }} />;
}

export function generateStaticParams() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}
