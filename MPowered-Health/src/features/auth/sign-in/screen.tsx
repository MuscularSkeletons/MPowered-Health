import { s } from '@/features/auth/sign-in/styles';
// This screen signs an existing user in with their four-digit PIN.
import {
  completeDifferentAccountSignIn,
  getProfile,
  wasLocalAccountDeleted,
} from '@/features/account/repository';
import { isValidPin, pinDigits } from '@/features/auth/shared/pin-validation';
import { verifyAccountPin } from '@/features/auth/shared/pin-auth';
import { validAnswer } from '@/shared/forms/validation';
import { ActionButton, MhaHeader, palette } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Try the quick PIN first, then verify by email when needed.
type Step = 'pin' | 'email' | 'code';
// Manage sign-in steps while keeping one clear validation message.
export default function Login() {
  const [step, setStep] = useState<Step>('pin'),
    [pin, setPin] = useState(''),
    [email, setEmail] = useState(''),
    [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [deletedAccountPrompt, setDeletedAccountPrompt] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [hasLocalProfile, setHasLocalProfile] = useState<boolean | null>(null);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        const exists = !!profile;
        setHasLocalProfile(exists);
        if (!exists) setStep('email');
      })
      .catch(() => {
        if (active) {
          setHasLocalProfile(false);
          setStep('email');
          setError('Unable to load the saved account. You can still sign in with email.');
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const value = step === 'pin' ? pin : step === 'email' ? email : code;
  const ready =
    step === 'pin'
      ? isValidPin(pin)
      : step === 'email'
        ? validAnswer('Your email address', email)
        : code.length === 4;
  // Send typed text to the field used by the current step.
  const setValue = (text: string) => {
    setError('');
    // Email must retain letters, @, dots, and plus aliases. Only PINs and codes
    // are restricted to digits.
    if (step === 'email') {
      setEmail(text);
      return;
    }
    const digits = text.replace(/\D/g, '');
    if (step === 'pin') setPin(pinDigits(text));
    else setCode(digits);
  };
  // Email screens advance locally; PIN sign-in checks stored credentials.
  const next = async () => {
    if (!ready || pending.current) return;
    if (step === 'email' && !emailVerificationRequired) {
      pending.current = true;
      setChecking(true);
      setError('');
      try {
        if (await wasLocalAccountDeleted(email)) {
          setDeletedAccountPrompt(true);
        } else {
          setCode('');
          setStep('code');
        }
      } catch {
        setError('Unable to check this account. Please try again.');
      } finally {
        pending.current = false;
        setChecking(false);
      }
      return;
    }
    if (step === 'code' && !emailVerificationRequired) {
      pending.current = true;
      setChecking(true);
      setError('');
      try {
        if (!(await completeDifferentAccountSignIn(email))) {
          setDeletedAccountPrompt(true);
          return;
        }
        router.replace('/dashboard');
      } catch {
        setError('Unable to complete sign in. Please try again.');
      } finally {
        pending.current = false;
        setChecking(false);
      }
      return;
    }
    if (emailVerificationRequired) {
      // Recovery needs a verified server response; a typed code is not authentication.
      setError(
        emailVerificationRequired
          ? 'Email verification could not be started. Please try again later.'
          : 'Email recovery is not connected yet. Please use the PIN saved on this device.',
      );
      return;
    }
    pending.current = true;
    setChecking(true);
    setError('');
    try {
      const result = await verifyAccountPin(pin);
      if (result.ok) {
        setPin('');
        router.replace('/dashboard');
      } else if (result.requiresEmailVerification) {
        // Repeated failures leave PIN entry and show the account email check immediately.
        setPin('');
        setEmailVerificationRequired(true);
        setStep('email');
        setError(result.message ?? 'Verify your email address to continue.');
      } else setError(result.message ?? 'Incorrect PIN. Please try again.');
    } catch {
      setError('Unable to check your PIN. Please try again.');
    } finally {
      pending.current = false;
      setChecking(false);
    }
  };
  if (hasLocalProfile === null) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <MhaHeader />
        <View style={s.center}>
          <Text style={s.loading}>Loading sign-in…</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <KeyboardAvoidingView
        style={s.center}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.content}>
          {step !== 'pin' &&
          !(step === 'email' && emailVerificationRequired) &&
          !(step === 'email' && hasLocalProfile === false) ? (
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
                  ? emailVerificationRequired
                    ? 'Verify your email address'
                    : 'Email sign-in'
                  : 'We’re sending a verification code to this email address'}
            </Text>
            <Text style={s.copy}>
              {step === 'pin'
                ? 'Enter your 4-digit PIN to continue.'
                : step === 'email'
                  ? emailVerificationRequired
                    ? 'Enter the email address linked to your account to continue securely.'
                    : 'Enter your email address to sign in on this device.'
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
              maxLength={step === 'email' ? 254 : 4}
              editable={!checking}
              accessibilityLabel={
                step === 'pin'
                  ? 'Enter 4-digit PIN'
                  : step === 'email'
                    ? 'Your email address'
                    : 'Verification code'
              }
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
                disabled={checking}
                onPress={() => {
                  setError('');
                  setEmailVerificationRequired(false);
                  setStep('email');
                }}
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
            {error ? (
              <Text accessibilityRole="alert" style={[s.help, { color: palette.error }]}>
                {error}
              </Text>
            ) : null}
            <View style={s.action}>
              <ActionButton
                label={checking ? 'Checking…' : step === 'code' ? 'Verify' : 'Continue'}
                disabled={!ready || checking}
                onPress={next}
              />
            </View>
          </View>
          {step === 'pin' ? (
            <View style={s.accountSwitch}>
              <Pressable
                accessibilityRole="button"
                disabled={checking}
                onPress={() => {
                  setError('');
                  setEmailVerificationRequired(false);
                  setStep('email');
                }}
                style={({ pressed }) => [s.accountButton, pressed && s.accountButtonPressed]}
              >
                <Text style={s.accountLink}>Log in to a different account</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
      <Modal visible={deletedAccountPrompt} transparent animationType="fade">
        <View style={s.modalBackdrop}>
          <View accessibilityViewIsModal style={s.dialog}>
            <Text style={s.dialogTitle}>Account not found</Text>
            <Text accessibilityRole="alert" style={s.dialogCopy}>
              An account with this email address does not exist
            </Text>
            <ActionButton
              label="Register"
              onPress={() => {
                setDeletedAccountPrompt(false);
                router.replace({
                  pathname: '/onboarding/0',
                  params: {
                    fresh: String(Date.now()),
                    flow: 'onboarding',
                  },
                });
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// Group sign-in layout, field, message, and action styles below.
