import { s } from '../styles';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';

/** Displays a draggable score input and converts touch positions into values. */
export function ScoreSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<View>(null);
  // Cache the track position so pointer movement can become a score.
  const metrics = useRef({ left: 0, width: 1, ready: false });
  const lastValue = useRef(value);
  useEffect(() => {
    lastValue.current = value;
  }, [value]);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /**
   * Converts a touch position into a score along the slider.
   *
   * Screen coordinates stay stable while the thumb moves beneath the user's finger. Using locationX here causes the score to jump when the touch target changes. Clamp the pointer to the track and round to a whole-number score.
   */
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

  /** Measures the slider position so touch coordinates map to the right score. */
  const measureTrack = (pageX?: number) =>
    trackRef.current?.measureInWindow((left, _top, width) => {
      metrics.current = { left, width: Math.max(width, 1), ready: true };
      if (pageX != null) updateFromPageX(pageX);
    });

  // Keep one gesture responder for the full drag.
  // PanResponder stores these callbacks; refs are read only during a gesture.
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
    <View style={s.sliderArea}>
      <View
        ref={trackRef}
        collapsable={false}
        onLayout={() => measureTrack()}
        {...pan.panHandlers}
        style={s.sliderTrack}
      >
        <View pointerEvents="none" style={[s.sliderFill, { width: `${value * 10}%` }]} />
        <View pointerEvents="none" style={[s.sliderThumb, { left: `${value * 10}%` }]}>
          <View style={s.sliderBubble}>
            <Text style={s.sliderBubbleText}>{value}</Text>
          </View>
        </View>
      </View>
      <View style={s.sliderEnds}>
        <Text style={s.sliderEnd}>0</Text>
        <Text style={s.sliderEnd}>10</Text>
      </View>
    </View>
  );
}
