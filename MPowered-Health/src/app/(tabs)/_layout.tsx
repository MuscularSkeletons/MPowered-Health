import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Maps to the (tabs) folder and hides the duplicate header */}
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      {/* Maps to your standalone assessment screen */}
      {/* <Stack.Screen name="assessment" options={{ title: 'Assessment' }} /> */}
    </Stack>
  );
}