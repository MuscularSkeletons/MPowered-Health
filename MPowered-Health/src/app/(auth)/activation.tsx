import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';
import { useAuth } from '@/context/authcontext';

/** Shows the first Front-End activation screen after the backend confirms onboarding. */
export default function ActivationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View style={styles.content}>
        <View style={styles.progressHeader}>
          <Text style={styles.eyebrow}>SETTING UP YOUR MPOWERED PLAN</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <View style={styles.hero}>
          <View style={styles.imageCard}>
            <View style={styles.imageHalo} />
            <Image
              source={require('@/assets/images/onboarding-launch.png')}
              resizeMode="contain"
              style={styles.image}
            />
          </View>
          <Text style={styles.message}>
            {user?.name ? `${user.name}, you’re off to` : 'You’re off to'} an MPowered start!
          </Text>
          <Text style={styles.description}>
            Your profile is ready. Continue to explore your health tools and start tracking what matters to you.
          </Text>
        </View>
        <PrimaryButton label="Continue" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, overflow: 'hidden', backgroundColor: palette.background },
  glowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -145,
    right: -95,
    backgroundColor: palette.light,
    opacity: 0.45,
  },
  glowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -145,
    left: -105,
    backgroundColor: palette.accent,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 22,
  },
  progressHeader: { alignItems: 'center' },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1.1, color: palette.primary },
  progressTrack: { width: 86, height: 5, marginTop: 13, borderRadius: 3, backgroundColor: palette.line },
  progressFill: { width: '100%', height: '100%', borderRadius: 3, backgroundColor: palette.primary },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 22 },
  imageCard: {
    width: 208,
    height: 208,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  imageHalo: { position: 'absolute', width: 156, height: 156, borderRadius: 78, backgroundColor: palette.surfaceSoft },
  image: { width: 150, height: 150 },
  message: {
    maxWidth: 380,
    marginTop: 34,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.55,
    color: palette.text,
    textAlign: 'center',
  },
  description: { maxWidth: 380, marginTop: 14, fontSize: 14, lineHeight: 21, color: palette.muted, textAlign: 'center' },
});
