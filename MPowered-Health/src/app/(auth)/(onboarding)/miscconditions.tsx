import { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authcontext";

export default function StoreOtherConditions() {
  // information to store
  const [otherCondition, setOtherCondition] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  // store typed text if present and proceed to next screen
  const handleComplete = async () => {
    if (!otherCondition) {
        Alert.alert("Error", "no input detected");
        return;
    }

    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    user.otherCondition = otherCondition;
    router.push("/(auth)/(onboarding)/completed");
  };

  // if question skipped, proceed to next page without storing any value
  const handleIncomplete = async () => {
    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    router.push("/(auth)/(onboarding)/completed");   
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}> 
            <View style={styles.content}>
                <View style={styles.header}>
                <Text style={styles.title}>Do you have any other conditions?</Text>
                </View>

                <View style={styles.form}>
                    <TextInput 
                        placeholder="Type conditions or symptoms that you know"
                        placeholderTextColor={"#999"}
                        keyboardType="default"
                        inputMode="text"
                        autoCorrect={false}
                        value={otherCondition}
                        onChangeText={setOtherCondition}
                        style={styles.input}
                    />
                </View>        
                
                {/* buttons */}
                <TouchableOpacity style={styles.button} onPress={handleComplete}>
                    <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleIncomplete}>
                    <Text style={styles.buttonText}>SKIP</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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