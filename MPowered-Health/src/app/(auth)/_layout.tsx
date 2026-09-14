import { Stack } from "expo-router";

// Specifies layout for authentication screens

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="splashscreen" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(onboarding)" />
    </Stack>
  );
}