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
import { sexOptions } from "@/constants/profile-options";

export default function StoreBirthSex() {
  // information to store
  const [birthsex, setBirthSex] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    // optional value so can just continue to next screen
    if (birthsex === "") {
        router.push("/(auth)/(onboarding)/birthyear");
        return;
    }

    setIsLoading(true);
    try {
        // confirm user authenticated
        if (!user) {
            throw new Error("User not authenticated");
        }
        // update profile with birth sex
        await updateUser({
            birthsex,
        });
        console.log("birth sex updated to db");
        router.push("/(auth)/(onboarding)/birthyear");        
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
          <Text style={styles.title}>Birth Sex</Text>
        </View>

        <View style={styles.form}>
            <TouchableOpacity style={styles.button} onPress={() => setBirthSex(sexOptions[0])}>
                <Text style={styles.buttonText}>{sexOptions[0]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setBirthSex(sexOptions[1])}>
                <Text style={styles.buttonText}>{sexOptions[1]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setBirthSex(sexOptions[2])}>
                <Text style={styles.buttonText}>{sexOptions[2]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setBirthSex(sexOptions[3])}>
                <Text style={styles.buttonText}>{sexOptions[3]}</Text>
            </TouchableOpacity>
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