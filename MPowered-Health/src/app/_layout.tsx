import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/authcontext';
import { AuthHeader } from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';
import { requiredSessionRoute } from '@/navigation/route-guard';

/** Shows the green brand initial while restoring the session. */
function AppLoadingScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AuthHeader />
      <View style={styles.body}>
        <View pointerEvents="none" style={styles.glowTop} />
        <View pointerEvents="none" style={styles.glowBottom} />
        <View style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingMark}>
              <Text style={styles.loadingM}>M</Text>
            </View>
            <Text style={styles.loadingTitle}>Welcome to MPowered Health</Text>
            <Text style={styles.loadingCopy}>Loading your secure account…</Text>
            <ActivityIndicator size="small" color={palette.primary} style={styles.spinner} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Directs users according to their session and onboarding status. */
function RouteGuard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const rootSegment = segments[0];
  const nestedSegment = segments[1];

  useEffect(() => {
    if (isLoading) return;
    const required = requiredSessionRoute({ user, rootSegment, nestedSegment });
    if (required) router.replace(required);
  }, [user, isLoading, rootSegment, nestedSegment, router]);

  if (isLoading) return <AppLoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

/** Gives all routes access to the authentication provider. */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surface },
  body: { flex: 1, overflow: 'hidden', backgroundColor: palette.background },
  glowTop: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    top: -140,
    right: -110,
    backgroundColor: palette.accent,
    opacity: 0.2,
  },
  glowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -155,
    left: -110,
    backgroundColor: palette.accent,
    opacity: 0.2,
  },
  loadingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 42,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  loadingMark: {
    width: 74,
    height: 74,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingM: { fontSize: 42, fontWeight: '800', color: palette.success },
  loadingTitle: { marginTop: 24, fontSize: 22, fontWeight: '800', color: palette.text, textAlign: 'center' },
  loadingCopy: { marginTop: 9, fontSize: 14, lineHeight: 21, color: palette.muted, textAlign: 'center' },
  spinner: { marginTop: 24 },
});
