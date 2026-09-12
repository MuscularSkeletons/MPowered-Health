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
import { BIRTH_YEAR_RANGE } from "@/constants/profile/profile-constants";

export default function StoreBirthYear() {
  // information to store
  const [birthyearstr, setBirthYearStr] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!birthyearstr) {
        Alert.alert("Error", "no input detected");
        return;
    }
    if (birthyearstr.length != 4) {
        Alert.alert("Error", "invalid year entered");
        return;
    }

    // convert string to numeric type
    const numericBirthYear = Number(birthyearstr.replace(/[^0-9]/g, ""));

    // verify birth year within a valid time frame
    if ((numericBirthYear < BIRTH_YEAR_RANGE.LOWER_BOUND) || (numericBirthYear > BIRTH_YEAR_RANGE.UPPER_BOUND)) {
        Alert.alert("Error", "please enter a valid years");
        return;
    }

    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    user.birthyear = numericBirthYear;
    router.push("/(auth)/(onboarding)/completed");
  };

  // if question skipped, still need to mark onboarding as complete
  const handleIncomplete = async () => {
    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    router.push("/(auth)/(onboarding)/completed");   
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Birth Year</Text>
        </View>

        <View style={styles.form}>
            <TextInput 
                placeholder="YYYY"
                placeholderTextColor={"#999"}
                keyboardType="number-pad"
                inputMode="numeric"
                autoCorrect={false}
                value={birthyearstr}
                onChangeText={setBirthYearStr}
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