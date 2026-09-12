import { Stack } from "expo-router";

// Specifies layout for authentication screens

export default function OnboardingLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitle: 'MPowered Health',
      }}>
        <Stack.Screen name="onboarding"
        />
        <Stack.Screen name="name"
        />
        <Stack.Screen name="birthsex" />
        <Stack.Screen name="birthyear" />
        <Stack.Screen name="diagnosis" />
        <Stack.Screen name="conditions" />
        <Stack.Screen name="misconditions" />
        <Stack.Screen name="completed" />
    </Stack>
  );
}