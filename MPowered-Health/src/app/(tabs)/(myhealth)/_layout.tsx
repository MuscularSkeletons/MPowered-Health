import { Stack } from 'expo-router';

/** Specifies stack for my health tab */
export default function MyHealthLayout() {
  return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(prescriptions)" />
          <Stack.Screen name="painrecords" />
          <Stack.Screen name="healthprofile" />
        </Stack>
  );
}
