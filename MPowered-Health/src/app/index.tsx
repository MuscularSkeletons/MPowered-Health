import { Redirect } from 'expo-router';

// Open the existing support-person home directly, without the patient role selector.
export default function Index() {
  return <Redirect href="/support-home" />;
}
