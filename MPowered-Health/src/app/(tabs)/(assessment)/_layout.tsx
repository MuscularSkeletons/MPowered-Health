import { Stack } from 'expo-router';

/** Specifies stack for assessment tab */
export default function AsssessmentLayout() {
  return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
        </Stack>
  );
}
