import { 
  Text, 
  View, 
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "expo-router";
import { openBrowserAsync } from 'expo-web-browser';
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: async () => {
          console.log('Sign Out Pressed');
          await signOut();
          router.replace("/(auth)/login");
        },
        style: 'destructive',
      }
    ])
  }

  /** Opens a policy without losing the current onboarding screen. */
  const openPolicy = async (url: string) => {
    try {
      await openBrowserAsync(url);
    } catch {
      Alert.alert('Unable to open page', 'Please try again.');
    }
  }

  return (
    <AuthScreen>
      <AuthIntro
        sectionLabel="SETTINGS"
        title="Edit Your Profile"
      />
      <PrimaryButton
          label="Edit Profile"
          onPress={() => router.push('/(tabs)/(settings)/profile')}
        />
      <PrimaryButton
        label="Notifications"
        onPress={() => router.push('/(tabs)/(settings)/notifications')}
      />
      <Text accessibilityRole="link" style={styles.link}
        onPress={() => void openPolicy('https://muscha.org/privacy-policy/')}>
        Privacy Policy
      </Text>
      <Text accessibilityRole="link" style={styles.link}
        onPress={() => void openPolicy('https://muscha.org/terms-and-conditions/')}>
        Terms and Conditions
      </Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    color: 'red',
    fontWeight: 'bold',
  },
  deleteAccountText: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },
  link: { 
    color: palette.primaryDark, 
    textDecorationLine: 'underline' 
  },
});