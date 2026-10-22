import { 
    useRef, 
    useState, 
    useEffect,
} from "react";
import { 
    PanResponder,
    View,
    Text,
    StyleSheet
} from "react-native";
import { palette } from "@/constants/ui/styling";

/** Defines slider component for assessment questions */
export function ScoreSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const trackRef = useRef<View>(null);
  const metrics = useRef({ left: 0, width: 1, ready: false });
  const lastValue = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    lastValue.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  const updateFromPageX = (pageX: number) => {
    if (!metrics.current.ready) return;
    const next = Math.max(
      0,
      Math.min(10, Math.round(((pageX - metrics.current.left) / metrics.current.width) * 10)),
    );
    if (next !== lastValue.current) {
      lastValue.current = next;
      onChangeRef.current(next);
    }
  };

  const measureTrack = (pageX?: number) =>
    trackRef.current?.measureInWindow((left, _top, width) => {
      metrics.current = { left, width: Math.max(width, 1), ready: true };
      if (pageX != null) updateFromPageX(pageX);
    });

  // PanResponder keeps these callbacks for the full drag; refs are read only during a gesture.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => measureTrack(event.nativeEvent.pageX),
      onPanResponderMove: (event) => updateFromPageX(event.nativeEvent.pageX),
      onPanResponderTerminationRequest: () => false,
    }),
  );

  return (
    <View style={styles.sliderArea}>
      <View
        ref={trackRef}
        collapsable={false}
        onLayout={() => measureTrack()}
        {...pan.panHandlers}
        style={styles.sliderTrack}
      >
        <View pointerEvents="none" style={[styles.sliderFill, { width: `${value * 10}%` }]} />
        <View pointerEvents="none" style={[styles.sliderThumb, { left: `${value * 10}%` }]}>
          <View style={styles.sliderBubble}>
            <Text style={styles.sliderBubbleText}>{value}</Text>
          </View>
        </View>
      </View>
      <View style={styles.sliderEnds}>
        <Text style={styles.sliderEnd}>0</Text>
        <Text style={styles.sliderEnd}>10</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    sliderArea: { marginTop: 28, marginBottom: 12 },
    sliderTrack: {
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
    justifyContent: 'center',
    },
    sliderFill: {
    position: 'absolute',
    left: 0,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.accent,
    },
    sliderThumb: {
    position: 'absolute',
    marginLeft: -10,
    width: 20,
    height: 42,
    borderRadius: 6,
    backgroundColor: palette.accent,
    alignItems: 'center',
    },
    sliderBubble: {
    position: 'absolute',
    top: -40,
    minWidth: 42,
    height: 34,
    borderRadius: 7,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    },
    sliderBubbleText: { fontSize: 16, fontWeight: '800', color: palette.text },
    sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
    sliderEnd: { fontSize: 11, fontWeight: '700', color: palette.muted },
});