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

export default function StoreName() {
  // information to store
  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    if (!name) {
        Alert.alert("Error", "mandatory field missing");
        return;
    }

    // don't allow trailing/preceding white space
    const trimmedName = name.trim();
    // don't allow only white space
    if (!trimmedName) {
        Alert.alert("Error", "white space only is not allowed");
        return;
    }

    setIsLoading(true);
    try {
        // confirm user authenticated
        if (!user) {
            throw new Error("User not authenticated");
        }
        // update profile with name
        await updateUser({
            name: trimmedName,
        });
        console.log("name updated to db");
        router.push("/(auth)/(onboarding)/birthsex");        
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
          <Text style={styles.title}>Name</Text>
        </View>

        <View style={styles.form}>
            <TextInput 
                placeholder="Name"
                placeholderTextColor={"#999"}
                inputMode="text"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
        </View>
        
        
        {/* buttons */}
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          {/*if loading, replace button with loading indicator */}
          {isLoading ? (
              <ActivityIndicator size={24} color="#fff" />
          ) : (
              <Text style={styles.buttonText}>SUBMIT</Text>
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