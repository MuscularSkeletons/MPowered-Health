import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthHeader } from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';

const pages: { title: string; image: ImageSourcePropType }[] = [
  {
    title: 'Track your pain and its impacts weekly',
    image: require('@/assets/images/splash-track.png'),
  },
  {
    title: 'Easily share your pain logs with your healthcare professionals',
    image: require('@/assets/images/splash-share.png'),
  },
  {
    title: 'Get tailored questions to assist your medical consultation',
    image: require('@/assets/images/splash-questions.png'),
  },
];

/** Presents the Front-End welcome experience while retaining the backend auth routes. */
export default function SplashScreen() {
  const router = useRouter();
  const list = useRef<FlatList<(typeof pages)[number]>>(null);
  const current = useRef(0);
  const [index, setIndex] = useState(0);
  const width = Dimensions.get('window').width;
  const [onViewableItemsChanged] = useState(
    () => ({ viewableItems }: { viewableItems: ViewToken<(typeof pages)[number]>[] }) => {
      if (viewableItems[0]?.index == null) return;
      current.current = viewableItems[0].index;
      setIndex(viewableItems[0].index);
    },
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (current.current + 1) % pages.length;
      current.current = next;
      list.current?.scrollToIndex({ index: next, animated: true });
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AuthHeader />
      <FlatList
        ref={list}
        data={pages}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        getItemLayout={(_, page) => ({ length: width, offset: width * page, index: page })}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.artworkCard}>
              <View style={styles.halo} />
              <Image source={item.image} resizeMode="contain" style={styles.artwork} />
            </View>
            <View style={styles.dots}>
              {pages.map((_, dot) => (
                <Pressable
                  key={dot}
                  accessibilityRole="button"
                  accessibilityLabel={`Show welcome page ${dot + 1}`}
                  onPress={() => list.current?.scrollToIndex({ index: dot, animated: true })}
                  style={[styles.dot, dot === index && styles.dotActive]}
                />
              ))}
            </View>
            <Text style={styles.message}>{item.title}</Text>
          </View>
        )}
      />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/signup')}
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
        >
          <Text style={styles.primaryText}>Get started →</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/login')}
          style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
        >
          <Text style={styles.secondaryText}>Sign in</Text>
        </Pressable>
      </View>
      <Text style={styles.sponsor}>Supported by ABBVIE</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surface },
  page: { paddingHorizontal: 24, justifyContent: 'center' },
  artworkCard: {
    height: 300,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  halo: { position: 'absolute', width: 280, height: 220, borderRadius: 110, backgroundColor: '#F1EBFF' },
  artwork: { width: 260, height: 260 },
  dots: {
    width: '100%',
    maxWidth: 520,
    minHeight: 44,
    alignSelf: 'center',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D8CFE5' },
  dotActive: { width: 34, backgroundColor: palette.primary },
  message: {
    width: '100%',
    maxWidth: 520,
    minHeight: 104,
    alignSelf: 'center',
    paddingHorizontal: 18,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.65,
    color: palette.text,
  },
  actions: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 30, gap: 6 },
  primary: { height: 50, borderRadius: 25, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  primaryPressed: { backgroundColor: palette.primaryDark, transform: [{ scale: 0.99 }] },
  primaryText: { color: palette.surface, fontSize: 14, fontWeight: '800' },
  secondary: { height: 40, alignItems: 'center', justifyContent: 'center' },
  secondaryPressed: { backgroundColor: '#F3EEFF', borderRadius: 12 },
  secondaryText: { color: palette.text, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  sponsor: { paddingTop: 8, paddingBottom: 14, color: palette.muted, fontSize: 10, fontWeight: '500', textAlign: 'center' },
});
