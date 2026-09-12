import { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authcontext";

export default function CompleteOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
        // confirm user authenticated
        if (!user) {
            throw new Error("User not authenticated");
        }
        // update profile with all information
        await updateUser({
            name: user.name,
            birthsex: user.birthsex,
            birthyear: user.birthyear,
            onboardingComplete: true,
        });
        console.log("information uploaded");
        router.replace("/(tabs)");        
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to complete. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Thank you, {user?.name}</Text>
        </View>        
        
        {/* buttons */}
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
            {/*if loading, replace button with loading indicator */}
            {isLoading ? (
                <ActivityIndicator size={24} color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Continue</Text>
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        paddingHorizontal: 28,
        paddingVertical: 32,
    },
    header: {
      marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 1.15,
        marginBottom: 10,
    },
    form: {
        width: '100%',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    button: {
        minHeight: 40,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '700',
    },
});