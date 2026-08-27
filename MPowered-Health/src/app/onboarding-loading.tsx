import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActionButton, palette } from '@/components/mha-ui';

const pages: { image: ImageSourcePropType; message: string; delay?: number }[] = [
  {
    image: require('../../assets/images/onboarding-launch.png'),
    message: "You're off to an MPowered start!",
    delay: 1800,
  },
  {
    image: require('../../assets/images/onboarding-questionnaire.png'),
    message: 'Next, you’ll complete short questionnaires about how your pain is impacting you.',
    delay: 2600,
  },
  {
    image: require('../../assets/images/onboarding-questions.png'),
    message: 'Based on your answers, this app suggests questions you can ask your doctor.',
  },
];

export default function OnboardingLoading() {
  const { name = 'Jane' } = useLocalSearchParams<{ name?: string }>();
  const [page, setPage] = useState(0);
  const current = pages[page];

  useEffect(() => {
    if (!current.delay) return;
    const timer = setTimeout(
      () => setPage((value) => Math.min(value + 1, pages.length - 1)),
      current.delay,
    );
    return () => clearTimeout(timer);
  }, [current.delay]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={s.glowTop} />
      <View pointerEvents="none" style={s.glowBottom} />
      <View style={s.content}>
        <View style={s.progressHeader}>
          <Text style={s.eyebrow}>SETTING UP YOUR MPOWERED PLAN</Text>
          <View style={s.dots}>
            {pages.map((_, index) => (
              <View key={index} style={[s.dot, index <= page && s.dotOn]} />
            ))}
          </View>
        </View>
        <View style={s.hero}>
          <View style={s.imageCard}>
            <View style={s.imageHalo} />
            <Image source={current.image} resizeMode="contain" style={s.image} />
          </View>
          <Text style={s.message}>{current.message}</Text>
          {page < pages.length - 1 ? (
            <View style={s.loadingRow}>
              <View style={s.loadingDot} />
              <Text style={s.loadingText}>Preparing your experience…</Text>
            </View>
          ) : (
            <Text style={s.ready}>You’re ready to begin your weekly check-in.</Text>
          )}
        </View>
        <View style={s.footer}>
          {page === pages.length - 1 ? (
            <ActionButton
              label="Continue"
              onPress={() => router.replace({ pathname: '/dashboard', params: { name } })}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background, overflow: 'hidden' },
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
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.primary,
  },
  dots: { flexDirection: 'row', gap: 7, marginTop: 13 },
  dot: { width: 24, height: 5, borderRadius: 3, backgroundColor: palette.line },
  dotOn: { backgroundColor: palette.primary },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 22,
  },
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
  imageHalo: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: palette.surfaceSoft,
  },
  image: { width: 150, height: 150 },
  message: {
    maxWidth: 360,
    marginTop: 34,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.55,
    color: palette.text,
    textAlign: 'center',
  },
  loadingRow: {
    minHeight: 34,
    marginTop: 21,
    paddingHorizontal: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.surfaceSoft,
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.secondary,
  },
  loadingText: { fontSize: 12, fontWeight: '700', color: palette.muted },
  ready: {
    marginTop: 17,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
  },
  footer: { minHeight: 52, width: '100%' },
});
