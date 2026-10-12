import { Stack } from 'expo-router';

export default function QuestionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="questions" />
      <Stack.Screen name="addquestion" />
    </Stack>
  );
}