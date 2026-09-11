import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/authcontext";

// anything in here has access to authentication
function RouteGuard() {
  const router = useRouter();
  const { user } = useAuth();

  // display login screen if not authenticated
  const segments = useSegments(); // use to determine at what screen/screen group at
  const inAuthSection = segments[0] === "(auth)";
  const inTabsSection = segments[0] === "(tabs)";
  const inOnboardingSection = segments[1] === "(onboarding)";

  // check if user authenticated and determines what screene to be in
  useEffect(() => {
    if (!user) {
      // if in authentication screens already, do not need to redirect
      if (!inAuthSection) {
        router.replace("/(auth)/login");
      }
    } else if (!user.onboardingComplete) {
      if (!inOnboardingSection) {
        router.replace("/(auth)/(onboarding)/onboarding");
      }
    } else {
      if (!inTabsSection) {
        router.replace("/(tabs)");
      }
    }
  }, [user, segments, router]); // run this effect if any of these values change

  return (
    <Stack screenOptions={{ headerShown: false}}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  )
}

// Specifies root layout for the app

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard/>
    </AuthProvider>
  );
}
