import { StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { palette } from '@/constants/ui/styling';

/** Creates the preview screens advertising the app core features shown in the welcome screen */

/**
 * Three pairs of screenshots previews of the app for the three key features
 */
const previewPairs: readonly [ImageSource | number, ImageSource | number][] = [
  [require('@/assets/splash/pain-home.png'), require('@/assets/splash/pain-summary.png')],
  [require('@/assets/splash/health-home.png'), require('@/assets/splash/health-records.png')],
  [require('@/assets/splash/questions-home.png'), require('@/assets/splash/questions-add.png')],
];

/**
 * Draws one small example screen in the welcome artwork
 */
function ScreenPreview({ source, front }: { source: ImageSource | number; front?: boolean }) {
  return (
    <View style={[styles.phonePreview, front ? styles.front : styles.back]}>
      <View style={styles.phoneFrame}>
        <Image source={source} contentFit="cover" style={styles.screen} />
      </View>
    </View>
  );
}

/**
 * Displays the group of preview screens on the welcome page
 * Show the artwork pair that belongs to the current splash page
 */
export function SplashArtwork({ page }: { page: number }) {
  const [back, front] = previewPairs[page] ?? previewPairs[0];

  return (
    <View style={styles.canvas}>
      <ScreenPreview source={back} />
      <ScreenPreview source={front} front />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    maxWidth: 500,
    height: 294,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  phonePreview: {
    position: 'absolute',
    width: '51%',
    aspectRatio: 1179 / 2556,
    borderRadius: 19,
    backgroundColor: palette.surface,
  },
  phoneFrame: {
    flex: 1,
    padding: 4,
    borderWidth: 2,
    borderColor: palette.success,
    borderRadius: 19,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  screen: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  back: {
    left: '1%',
    top: 68,
  },
  front: {
    right: '3%',
    top: 18,
    zIndex: 2,
  },
});
