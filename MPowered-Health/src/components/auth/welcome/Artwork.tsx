/** Draws the preview artwork used on the welcome page. */
// This component displays the artwork used on the opening screens.
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { palette } from '@/constants/profile/ui';

// Each splash page uses a back preview and a front preview to create depth.
const previewPairs: readonly [ImageSourcePropType, ImageSourcePropType][] = [
  [require('@/assets/splash/pain-home.png'), require('@/assets/splash/pain-summary.png')],
  [require('@/assets/splash/health-home.png'), require('@/assets/splash/health-records.png')],
  [require('@/assets/splash/care-home.png'), require('@/assets/splash/plan-appointment.png')],
];

/**
 * Draws one small example screen in the welcome artwork.
 *
 * Give the front phone preview stronger styling to create depth.
 */
function ScreenPreview({ source, front }: { source: ImageSourcePropType; front?: boolean }) {
  return (
    <View style={[styles.phonePreview, front ? styles.front : styles.back]}>
      <View style={styles.phoneFrame}>
        <Image source={source} resizeMode="cover" style={styles.screen} />
      </View>
    </View>
  );
}

/**
 * Displays the group of preview screens on the welcome page.
 *
 * Pick the artwork pair that belongs to the current splash page.
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

// Keep phone positions and decorative shapes in one section.
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
    borderColor: palette.secondary,
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
    transform: [{ rotate: '-1.25deg' }],
  },
  front: {
    right: '3%',
    top: 18,
    zIndex: 2,
    transform: [{ rotate: '1.25deg' }],
  },
});
