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
import { diagnosisOptions } from "@/constants/profile/profile-options";

export default function StoreDiagnosis() {
  // information to store
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = async () => {
    if (hasDiagnosis === null) {
        Alert.alert("Error", "please select an option");
        return;
    }

    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    user.formalDiagnosis = hasDiagnosis;
    router.push("/(auth)/(onboarding)/conditions");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.content}>
            <View style={styles.header}>
            <Text style={styles.title}>Do you have a musculoskeletal for example arthritis, back pain, gout or chronic pain diagnosis from your doctor?</Text>
            </View>

            <View style={styles.form}>
                <TouchableOpacity style={styles.button} onPress={() => setHasDiagnosis(true)}>
                    <Text style={styles.buttonText}>{diagnosisOptions[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setHasDiagnosis(false)}>
                    <Text style={styles.buttonText}>{diagnosisOptions[1]}</Text>
                </TouchableOpacity>
            </View>    

            <Text>No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you</Text>    
            
            {/* buttons */}
            <TouchableOpacity style={styles.button} onPress={handleComplete}>
                <Text style={styles.buttonText}>Continue</Text>
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