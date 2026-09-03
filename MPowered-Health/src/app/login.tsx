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
import { validAnswer } from '@/utils/workflow-validation';

type Step = 'pin' | 'email' | 'code';
export default function Login() {
  const [step, setStep] = useState<Step>('pin'),
    [pin, setPin] = useState(''),
    [email, setEmail] = useState(''),
    [code, setCode] = useState('');
  const value = step === 'pin' ? pin : step === 'email' ? email : code;
  const ready =
    step === 'pin'
      ? pin.length >= 4
      : step === 'email'
        ? validAnswer('Your email address', email)
        : code.length === 4;
  const setValue = (text: string) => {
    // Email must retain letters, @, dots, and plus aliases. Only PINs and codes
    // are restricted to digits.
    if (step === 'email') {
      setEmail(text);
      return;
    }
    const digits = text.replace(/\D/g, '');
    if (step === 'pin') setPin(digits);
    else setCode(digits);
  };
  const next = () => {
    if (!ready) return;
    if (step === 'pin') router.replace('/dashboard');
    else if (step === 'email') setStep('code');
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
              onPress={() => setStep(step === 'code' ? 'email' : 'pin')}
            >
              <Text style={s.back}>‹ Back</Text>
            </Pressable>
          ) : null}
          <View style={s.intro}>
            <Text style={s.eyebrow}>SIGN IN</Text>
            <Text style={s.title}>
              {step === 'pin'
                ? 'Welcome back!'
                : step === 'email'
                  ? 'Please verify this device'
                  : 'We’re sending a verification code to this email address'}
            </Text>
            <Text style={s.copy}>
              {step === 'pin'
                ? 'Glad to see you again!'
                : step === 'email'
                  ? 'You are logging in to a new device or different account.'
                  : 'You can resend the code in two minutes.'}
            </Text>
          </View>
          <View style={s.form}>
            <Text style={s.label}>
              {step === 'pin'
                ? 'Enter PIN'
                : step === 'email'
                  ? 'Your email address'
                  : 'Verification code'}
            </Text>
            <TextInput
              key={step}
              secureTextEntry={step === 'pin'}
              keyboardType={step === 'email' ? 'email-address' : 'number-pad'}
              inputMode={step === 'email' ? 'email' : 'numeric'}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={step === 'email' ? 'email' : 'off'}
              maxLength={step === 'code' ? 4 : step === 'pin' ? 6 : 254}
              value={value}
              onChangeText={setValue}
              placeholder={
                step === 'pin'
                  ? 'Enter PIN'
                  : step === 'email'
                    ? 'Your email address'
                    : '4-digit code'
              }
              placeholderTextColor="#81798A"
              style={s.input}
            />
            {step === 'pin' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep('email')}
                style={s.inlineLink}
              >
                <Text style={s.inlineLinkText}>Forgot PIN?</Text>
              </Pressable>
            ) : null}
            {step === 'email' ? (
              <>
                <Text style={s.help}>
                  We’ll send a four-digit verification code to this email address.
                </Text>
                {email.length > 0 && !ready ? (
                  <Text accessibilityLiveRegion="polite" style={[s.help, { color: palette.error }]}>
                    Enter a valid email address.
                  </Text>
                ) : null}
              </>
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
                onPress={() => setStep('email')}
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
