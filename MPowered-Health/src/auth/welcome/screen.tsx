import { s } from './styles';
// This screen introduces the app and starts registration or sign-in.
import { SplashArtwork } from './Artwork';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// The user can swipe through these messages before choosing registration or sign-in.
const pages = [
  { title: 'Track your pain and its impacts weekly' },
  { title: 'Easily share your pain logs to your healthcare professionals' },
  { title: 'Get tailored questions to assist your medical consultation' },
];

// Track the visible introduction page and offer registration or sign-in.
export default function Splash() {
  const [index, setIndex] = useState(0);
  const currentIndex = useRef(0);
  const ref = useRef<FlatList<(typeof pages)[number]>>(null);
  const width = Dimensions.get('window').width;
  // Update the active dot when a new page becomes mostly visible.
  const [changed] = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken<(typeof pages)[number]>[] }) => {
        if (viewableItems[0]?.index != null) {
          currentIndex.current = viewableItems[0].index;
          setIndex(viewableItems[0].index);
        }
      },
  );
  // Advance messages automatically while still allowing manual swipes.
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentIndex.current + 1) % pages.length;
      currentIndex.current = next;
      ref.current?.scrollToIndex({ index: next, animated: true });
    }, 1900);
    return () => clearInterval(timer);
  }, []);
  return (
    <SafeAreaView style={s.safe}>
      <MhaHeader />
      <FlatList
        ref={ref}
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
          <View style={[s.page, { width }]}>
            <View style={s.art}>
              <SplashArtwork page={page} />
            </View>
            <View style={s.dots}>
              {pages.map((_, i) => (
                <Pressable
                  accessibilityLabel={`Show splash page ${i + 1}`}
                  key={i}
                  onPress={() => ref.current?.scrollToIndex({ index: i, animated: true })}
                  style={[s.dot, i === index && s.dotOn]}
                />
              ))}
            </View>
            <Text style={s.message}>{item.title}</Text>
          </View>
        )}
      />
      <View style={s.actions}>
        <Pressable
          style={({ pressed }) => [s.primary, pressed && s.primaryPressed]}
          onPress={() =>
            router.replace({
              pathname: '/get-started/0',
              params: {
                fresh: String(Date.now()),
                flow: 'onboarding',
              },
            })
          }
        >
          <Text style={s.primaryText}>Get started →</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.secondary, pressed && s.secondaryPressed]}
          onPress={() => router.replace('/login')}
        >
          <Text style={s.secondaryText}>Sign in</Text>
        </Pressable>
      </View>
      <Text style={s.sponsor}>Supported by ABBVIE</Text>
    </SafeAreaView>
  );
}

// Keep carousel, action, and support-logo styles below the behavior.
