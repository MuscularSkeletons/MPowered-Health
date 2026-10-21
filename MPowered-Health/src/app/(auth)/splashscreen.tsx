import { SplashArtwork } from '@/components/splash/artwork';
import { commonStyles, Header } from '@/components/shared/common';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View, ViewToken, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/ui/styling';

/** Specifies the rotating messages displayed on the splashscreen advertising app features */
const pages = [
  { title: 'Track your pain and its impacts weekly' },
  { title: 'Easily share your pain logs to your healthcare professionals' },
  { title: 'Get tailored questions to assist your medical consultation' },
];

/**
 * Shows the welcome page and the choices to sign in or get started
 * Displays main app features on a rotating basis
 */
export default function Splash() {
  const [index, setIndex] = useState(0);
  const currentIndex = useRef(0);
  const ref = useRef<FlatList<(typeof pages)[number]>>(null);
  const width = Dimensions.get('window').width;
  // Update the active dot when a new page becomes mostly visible
  const [changed] = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken<(typeof pages)[number]>[] }) => {
        if (viewableItems[0]?.index != null) {
          currentIndex.current = viewableItems[0].index;
          setIndex(viewableItems[0].index);
        }
      },
  );
  // Advance messages automatically while still allowing manual swipes
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentIndex.current + 1) % pages.length;
      currentIndex.current = next;
      ref.current?.scrollToIndex({ index: next, animated: true });
    }, 1900);
    return () => clearInterval(timer);
  }, []);
  return (
    <SafeAreaView style={commonStyles.safe} edges={['top']}>
      <Header />
      <FlatList
        ref={ref}
        style={commonStyles.body}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        data={pages}
        keyExtractor={(x) => x.title}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onViewableItemsChanged={changed}
        renderItem={({ item, index: page }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.art}>
              <SplashArtwork page={page} />
            </View>
            <View style={styles.dots}>
              {pages.map((_, i) => (
                <Pressable
                  accessibilityLabel={`Show splash page ${i + 1}`}
                  key={i}
                  onPress={() => ref.current?.scrollToIndex({ index: i, animated: true })}
                  style={[styles.dot, i === index && styles.dotOn]}
                />
              ))}
            </View>
            <Text style={styles.message}>{item.title}</Text>
          </View>
        )}
      />
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          onPress={() =>
            router.replace('/(auth)/signup')
          }
        >
          <Text style={styles.primaryText}>Get started →</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.secondaryText}>Sign in</Text>
        </Pressable>
        
      </View>
      <Text style={styles.sponsor}>Supported by ABBVIE</Text>
    </SafeAreaView>
  );
}

 const styles = StyleSheet.create({
  page: { paddingHorizontal: 24, backgroundColor: palette.background },
  art: {
    height: 294,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  message: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    minHeight: 104,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.65,
    color: palette.text,
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
  },
  dots: {
    width: '100%',
    maxWidth: 520,
    height: 48,
    alignSelf: 'center',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: palette.light },
  dotOn: { width: 34, height: 12, borderRadius: 6, backgroundColor: palette.success },
  actions: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 30,
    gap: 6,
    backgroundColor: palette.background,
  },
  primary: {
    height: 50,
    borderRadius: 9,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: { backgroundColor: palette.primaryDark, transform: [{ scale: 0.99 }] },
  primaryText: { fontSize: 14, fontWeight: '800', color: palette.text },
  secondary: { height: 40, alignItems: 'center', justifyContent: 'center' },
  secondaryPressed: { backgroundColor: palette.pressedBackground, borderRadius: 12 },
  secondaryText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: palette.text,
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 28,
    backgroundColor: palette.background,
  },
});