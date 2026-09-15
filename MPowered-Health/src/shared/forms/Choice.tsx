import { s } from '@/shared/forms/styles';
import { Pressable, Text, View } from 'react-native';

/** Displays a list of answer choices with single- or multiple-selection behavior. */
export function Choice({
  title,
  options,
  value,
  pick,
  multi = false,
}: {
  title?: string;
  options: string[];
  value: string[];
  pick: (v: string) => void;
  multi?: boolean;
}) {
  // This component reports the tapped value; the owning reducer decides how selection changes.
  return (
    <View style={s.choiceWrap}>
      {title ? <Text style={s.choiceTitle}>{title}</Text> : null}
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Pressable key={o} onPress={() => pick(o)} style={[s.choice, on && s.choiceOn]}>
            <Text style={[s.choiceText, on && s.choiceTextOn]}>{o}</Text>
            <View style={[multi ? s.square : s.circle, on && s.mark]}>
              <Text style={s.tick}>{on ? '✓' : ''}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
