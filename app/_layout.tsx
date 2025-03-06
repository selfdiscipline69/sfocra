import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome Screen (Full-Screen, No Tabs) */}
      <Stack.Screen name="index" />

      {/* Onboarding Screens */}
      <Stack.Screen name="signup" />
      <Stack.Screen name="question1" />
      <Stack.Screen name="question2" />
      <Stack.Screen name="question3" />
      <Stack.Screen name="question4" />

      {/* Main App with Tabs (Only After Onboarding) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}