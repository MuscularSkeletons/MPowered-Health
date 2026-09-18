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
    <View style={styles.container}>
      <Text>settings.</Text>
      <TouchableOpacity>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => void openPolicy('https://muscha.org/privacy-policy/')}>
        <Text>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => void openPolicy('https://muscha.org/terms-and-conditions/')}>
        <Text>Terms and Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Delete Account</Text>
      </TouchableOpacity>
    </View>
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
});
