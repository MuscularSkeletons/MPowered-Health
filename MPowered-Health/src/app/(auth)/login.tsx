import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { palette } from '@/constants/profile/ui';
import { toUserError, type AuthUserError } from '@/constants/profile/autherror';
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

const SAVED_EMAIL_KEY = 'mpowered.saved-email';

/** Displays the sign-in form and restores the remembered email address. */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthUserError | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    void AsyncStorage.getItem(SAVED_EMAIL_KEY).then((savedEmail) => {
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
  }, []);

  /** Validates the form and signs in through the authentication context. */
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await signIn(email.trim(), password);
      if (rememberMe) {
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
      }
      router.replace('/(tabs)');
    } catch (error) {
      const userError = toUserError(error);
      setAuthError(userError);
      Alert.alert('Error', userError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen compact>
      <Pressable onPress={() => router.replace('/(auth)/splashscreen')}>
        <Text style={authStyles.back}>‹ Back</Text>
      </Pressable>
      <AuthIntro
        sectionLabel="SIGN IN"
        title="Welcome back!"
        description="Sign in to continue your MPowered Health journey."
      />
      <AuthInput
        label="Email address"
        placeholder="you@example.com"
        keyboardType="email-address"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!isLoading}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setAuthError(null);
        }}
      />
      <AuthInput
        label="Password"
        placeholder="Enter your password"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        editable={!isLoading}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setAuthError(null);
        }}
        secure
        reveal={showPassword}
        onToggleReveal={() => setShowPassword((visible) => !visible)}
        onSubmitEditing={() => void handleLogin()}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberMe }}
        onPress={() => setRememberMe((checked) => !checked)}
        style={styles.rememberRow}
      >
        <View style={[styles.rememberBox, rememberMe && styles.rememberBoxChecked]}>
          {rememberMe ? <Text style={styles.rememberTick}>✓</Text> : null}
        </View>
        <Text style={styles.rememberText}>Remember my email address</Text>
      </Pressable>
      {authError ? (
        <Text accessibilityRole="alert" style={authStyles.error}>
          {authError.message}
        </Text>
      ) : null}
      <View style={authStyles.actions}>
        <PrimaryButton
          label="Sign in"
          loading={isLoading}
          disabled={!email.trim() || !password}
          onPress={() => void handleLogin()}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={() => router.push('/(auth)/signup')}
          style={authStyles.secondaryAction}
        >
          <Text style={authStyles.secondaryText}>New to MPowered Health? Get started</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  rememberBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: palette.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberBoxChecked: { backgroundColor: palette.primary, borderColor: palette.primary },
  rememberTick: { color: palette.surface, fontSize: 13, fontWeight: '800' },
  rememberText: { color: palette.muted, fontSize: 13, fontWeight: '600' },
});
