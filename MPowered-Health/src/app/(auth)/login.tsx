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

/** Keeps the existing backend password sign-in while presenting the Front-End form design. */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthUserError | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  /** Validates the form and delegates authentication to the unchanged backend context. */
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await signIn(email.trim(), password);
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
    <AuthScreen>
      <Pressable onPress={() => router.replace('/(auth)/splashscreen')}>
        <Text style={authStyles.back}>‹ Back</Text>
      </Pressable>
      <AuthIntro
        eyebrow="SIGN IN"
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
