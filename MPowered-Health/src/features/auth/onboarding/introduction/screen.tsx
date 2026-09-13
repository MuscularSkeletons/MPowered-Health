import { s } from './styles';
// This screen explains how the app works before opening the home page.
import { ActionButton } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// These pages advance in order and pause on the final page until the user continues.
const pages: { image: ImageSourcePropType; message: string; delay?: number }[] = [
  {
    image: require('@/assets/images/onboarding-launch.png'),
    message: "You're off to an MPowered start!",
    delay: 1800,
  },
  {
    image: require('@/assets/images/onboarding-questionnaire.png'),
    message: 'Next, you’ll complete short questionnaires about how your pain is impacting you.',
    delay: 2600,
  },
  {
    image: require('@/assets/images/onboarding-questions.png'),
    message: 'Based on your answers, this app suggests questions you can ask your doctor.',
  },
];

// Advance timed guidance pages and pause on the final Continue action.
export default function OnboardingLoading() {
  const { name = 'Jane' } = useLocalSearchParams<{ name?: string }>();
  const [page, setPage] = useState(0);
  const current = pages[page];

  // Create one timer for the current page and remove it if the screen changes.
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

// Group onboarding progress, artwork, message, and footer styles below.
