import { s } from '../questions/styles';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
export function CompactSelect({
  title,
  options,
  value,
  pick,
}: {
  title: string;
  options: string[];
  value: string[];
  pick: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.selectWrap}>
      <Text style={s.selectLabel}>{title}</Text>
      <Text style={s.optional}>optional</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={[s.selectField, open && s.selectFieldOpen]}
      >
        <Text style={[s.selectValue, !value[0] && s.datePlaceholder]}>
          {value[0] || 'Select healthcare practitioner service'}
        </Text>
        <Text style={s.selectChevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <View style={s.selectMenu}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                pick(option);
                setOpen(false);
              }}
              style={[s.selectOption, value[0] === option && s.selectOptionOn]}
            >
              <Text style={[s.selectOptionText, value[0] === option && s.selectOptionTextOn]}>
                {option}
              </Text>
              {value[0] === option ? <Text style={s.selectTick}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
