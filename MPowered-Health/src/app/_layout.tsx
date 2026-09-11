import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/authcontext";
import { Text, View, StyleSheet } from "react-native";

// anything in here has access to authentication
function RouteGuard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // display login screen if not authenticated
  const segments = useSegments(); // use to determine at what screen/screen group at
  const inAuthSection = segments[0] === "(auth)";
  const inTabsSection = segments[0] === "(tabs)";
  const inOnboardingSection = segments[1] === "(onboarding)";

  // check if user authenticated and determines what screene to be in
  useEffect(() => {
    if (isLoading) return; // do not determine user authentication state whilst still checking session
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
  }, [user, segments, router, isLoading]); // run this effect if any of these values change

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>temporary loading screen.</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});