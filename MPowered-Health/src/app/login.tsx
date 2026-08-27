import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, palette } from '@/components/mha-ui';

type Step = 'pin' | 'phone' | 'code';
export default function Login() {
  const [step, setStep] = useState<Step>('pin'),
    [pin, setPin] = useState(''),
    [phone, setPhone] = useState(''),
    [code, setCode] = useState('');
  const value = step === 'pin' ? pin : step === 'phone' ? phone : code;
  const ready =
    step === 'pin'
      ? pin.length >= 4
      : step === 'phone'
        ? phone.trim().length >= 8
        : code.length === 4;
  const setNumericValue = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (step === 'pin') setPin(digits);
    else if (step === 'phone') setPhone(digits);
    else setCode(digits);
  };
  const next = () => {
    if (step === 'pin') router.replace('/dashboard');
    else if (step === 'phone') setStep('code');
    else router.replace('/dashboard');
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <KeyboardAvoidingView
        style={s.center}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.content}>
          {step !== 'pin' ? (
            <Pressable
              accessibilityRole="button"
              style={s.backButton}
              onPress={() => setStep(step === 'code' ? 'phone' : 'pin')}
            >
              <Text style={s.back}>‹ Back</Text>
            </Pressable>
          ) : null}
          <View style={s.intro}>
            <Text style={s.eyebrow}>SIGN IN</Text>
            <Text style={s.title}>
              {step === 'pin'
                ? 'Welcome back!'
                : step === 'phone'
                  ? 'Please verify this device'
                  : 'We’re sending a verification code to this number'}
            </Text>
            <Text style={s.copy}>
              {step === 'pin'
                ? 'Glad to see you again!'
                : step === 'phone'
                  ? 'You are logging in to a new device or different account.'
                  : 'You can resend the code in two minutes.'}
            </Text>
          </View>
          <View style={s.form}>
            <Text style={s.label}>
              {step === 'pin'
                ? 'Enter PIN'
                : step === 'phone'
                  ? 'Your phone number'
                  : 'Verification code'}
            </Text>
            <TextInput
              secureTextEntry={step === 'pin'}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={step === 'code' ? 4 : step === 'pin' ? 6 : 15}
              value={value}
              onChangeText={setNumericValue}
              placeholder={
                step === 'pin'
                  ? 'Enter PIN'
                  : step === 'phone'
                    ? 'Your phone number'
                    : '4-digit code'
              }
              placeholderTextColor="#81798A"
              style={s.input}
            />
            {step === 'pin' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep('phone')}
                style={s.inlineLink}
              >
                <Text style={s.inlineLinkText}>Forgot PIN?</Text>
              </Pressable>
            ) : null}
            {step === 'phone' ? (
              <Text style={s.help}>We’ll send a four-digit verification code to this number.</Text>
            ) : null}
            {step === 'code' ? (
              <Pressable accessibilityRole="button" style={s.inlineLink}>
                <Text style={s.inlineLinkText}>Resend the verification code</Text>
              </Pressable>
            ) : null}
            <View style={s.action}>
              <ActionButton
                label={step === 'code' ? 'Verify' : 'Continue'}
                disabled={!ready}
                onPress={next}
              />
            </View>
          </View>
          {step === 'pin' ? (
            <View style={s.accountSwitch}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep('phone')}
                style={({ pressed }) => [s.accountButton, pressed && s.accountButtonPressed]}
              >
                <Text style={s.accountLink}>Log in to a different account</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  center: { flex: 1, justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 22 },
  back: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 8,
  },
  intro: { marginBottom: 30 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.15,
    color: palette.primary,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.65,
    color: palette.text,
  },
  copy: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 8 },
  form: { width: '100%' },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 8,
  },
  input: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: palette.accent,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: 1,
  },
  help: { fontSize: 12, lineHeight: 18, color: palette.muted, marginTop: 9 },
  inlineLink: { alignSelf: 'flex-end', paddingVertical: 11, paddingLeft: 16 },
  inlineLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
    textDecorationLine: 'underline',
  },
  action: { marginTop: 18 },
  accountSwitch: { marginTop: 22, alignItems: 'center' },
  accountButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  accountButtonPressed: { backgroundColor: palette.surfaceSoft },
  accountLink: { fontSize: 12.5, fontWeight: '600', color: palette.muted },
});
