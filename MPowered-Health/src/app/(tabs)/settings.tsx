import { 
  Text, 
  View, 
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "expo-router";

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

  return (
    <View style={styles.container}>
      <Text>settings.</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
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
