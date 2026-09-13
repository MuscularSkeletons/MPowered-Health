import { s } from '@/shared/forms/styles';
import { Text, TextInput, View } from 'react-native';
import { fourDigits } from './input-format';
export function Field({
  label,
  value,
  set,
  error,
  editable = true,
  input = 'text',
  multiline = false,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  error?: string;
  editable?: boolean;
  input?: 'text' | 'email' | 'pin' | 'year' | 'decimal';
  multiline?: boolean;
}) {
  const isEmail = input === 'email';
  const isPin = input === 'pin';

  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={(text) => set(isPin ? fourDigits(text) : text)}
        secureTextEntry={isPin}
        accessibilityLabel={label}
        autoCapitalize={isEmail || isPin ? 'none' : 'sentences'}
        autoCorrect={!isEmail && !isPin}
        autoComplete={isEmail ? 'email' : 'off'}
        maxLength={isPin ? 4 : isEmail ? 254 : undefined}
        keyboardType={
          isEmail
            ? 'email-address'
            : isPin || input === 'year'
              ? 'number-pad'
              : input === 'decimal'
                ? 'decimal-pad'
                : 'default'
        }
        inputMode={
          isEmail
            ? 'email'
            : isPin || input === 'year'
              ? 'numeric'
              : input === 'decimal'
                ? 'decimal'
                : 'text'
        }
        placeholder={label}
        placeholderTextColor="#81798A"
        style={[
          s.input,
          multiline
            ? {
                minHeight: 130,
              }
            : null,
        ]}
        multiline={multiline}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={s.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
