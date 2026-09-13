import { s } from '@/features/care-planner/shared/review-styles';
// This screen lets the user review and update a planned healthcare appointment.
import { palette } from '@/shared/ui/mha-ui';
import { useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function SignaturePad({
  paths,
  setPaths,
}: {
  paths: string[];
  setPaths: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  // Remember which stroke is active while the user drags across the pad.
  const activePath = useRef(-1);
  // Build the gesture responder once and append points to the current stroke.
  // PanResponder stores these callbacks; refs are read only during a gesture.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { x, y } =
          event.nativeEvent.locationX === undefined
            ? { x: 0, y: 0 }
            : {
                x: event.nativeEvent.locationX,
                y: event.nativeEvent.locationY,
              };
        setPaths((previous) => {
          activePath.current = previous.length;
          return [...previous, `M ${x} ${y}`];
        });
      },
      onPanResponderMove: (event) => {
        const x = event.nativeEvent.locationX,
          y = event.nativeEvent.locationY;
        setPaths((previous) =>
          previous.map((path, index) =>
            index === activePath.current ? `${path} L ${x} ${y}` : path,
          ),
        );
      },
    }),
  );
  const clear = () => setPaths([]);
  return (
    <View>
      <View style={s.signaturePad} {...responder.panHandlers}>
        <Svg width="100%" height="120" pointerEvents="none">
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={palette.text}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {!paths.length ? <Text style={s.signatureHint}>Draw signature here</Text> : null}
      </View>
      <Pressable onPress={clear} style={s.clearSignature}>
        <Text style={s.clearSignatureText}>Clear signature</Text>
      </Pressable>
    </View>
  );
}
