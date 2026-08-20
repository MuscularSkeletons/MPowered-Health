import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

const previewPairs: readonly [ImageSourcePropType, ImageSourcePropType][] = [
  [
    require('../../assets/splash/pain-home.png'),
    require('../../assets/splash/pain-summary.png'),
  ],
  [
    require('../../assets/splash/health-home.png'),
    require('../../assets/splash/health-records.png'),
  ],
  [
    require('../../assets/splash/care-home.png'),
    require('../../assets/splash/plan-appointment.png'),
  ],
];

function ScreenPreview({ source, front }: { source: ImageSourcePropType; front?: boolean }) {
  return (
    <View style={[styles.phoneShadow, front ? styles.front : styles.back]}>
      <View style={styles.phoneFrame}>
        <Image source={source} resizeMode="cover" style={styles.screen} />
      </View>
    </View>
  );
}

export function SplashArtwork({ page }: { page: number }) {
  const [back, front] = previewPairs[page] ?? previewPairs[0];

  return (
    <View style={styles.canvas}>
      <View style={styles.glow} />
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
  glow: {
    position: 'absolute',
    top: 62,
    left: '10%',
    right: '10%',
    height: 205,
    borderRadius: 103,
    backgroundColor: '#F1EBFF',
    opacity: 0.72,
  },
  phoneShadow: {
    position: 'absolute',
    width: '51%',
    aspectRatio: 1179 / 2556,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    shadowColor: '#2C174B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneFrame: {
    flex: 1,
    padding: 4,
    borderWidth: 2,
    borderColor: '#D8C7FA',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  screen: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  back: {
    left: '3%',
    top: 68,
    transform: [{ rotate: '-1.5deg' }],
  },
  front: {
    right: '3%',
    top: 18,
    zIndex: 2,
    transform: [{ rotate: '1.25deg' }],
  },
});
