import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authcontext';
import { toUserError, type AuthUserError } from '@/constants/profile/autherror';
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

/** Displays the account registration form. */
export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthUserError | null>(null);
  const router = useRouter();
  const { signUp } = useAuth();
  const passwordsMatch = !confirmPassword || confirmPassword === password;

  /** Validates matching passwords and creates the account through the authentication context. */
  const handleSignUp = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await signUp(email.trim(), password);
      router.replace('/(auth)/(onboarding)/onboarding');
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
        sectionLabel="GET STARTED"
        title="Create your account"
        description="Create your account, then tell us what matters for your health."
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
        placeholder="Enter a password"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        editable={!isLoading}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setAuthError(null);
        }}
        secure
        reveal={showPassword}
        onToggleReveal={() => setShowPassword((visible) => !visible)}
      />
      <AuthInput
        label="Confirm password"
        placeholder="Re-enter your password"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        editable={!isLoading}
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          setAuthError(null);
        }}
        secure
        reveal={showConfirmPassword}
        onToggleReveal={() => setShowConfirmPassword((visible) => !visible)}
        onSubmitEditing={() => void handleSignUp()}
      />
      {!passwordsMatch ? (
        <Text accessibilityRole="alert" style={authStyles.error}>
          Passwords do not match.
        </Text>
      ) : null}
      {authError ? (
        <Text accessibilityRole="alert" style={authStyles.error}>
          {authError.message}
        </Text>
      ) : null}
      <View style={authStyles.actions}>
        <PrimaryButton
          label="Create account"
          loading={isLoading}
          disabled={!email.trim() || !password || !confirmPassword || !passwordsMatch}
          onPress={() => void handleSignUp()}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={() => router.push('/(auth)/login')}
          style={authStyles.secondaryAction}
        >
          <Text style={authStyles.secondaryText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
