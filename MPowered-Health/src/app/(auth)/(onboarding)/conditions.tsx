import { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authcontext";
import { painConditionsOptions } from "@/constants/profile/profile-options";

export default function StorePainConditions() {
  // information to store
  const [painConditions, setPainConditions] = useState<string[]>([]);

  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = async () => {
    // if no pain conditions selected, can still move on as pain condition may not be on the list
    if (painConditions.length === 0) {
        router.push("/(auth)/(onboarding)/miscconditions");
        return;
    }

    // confirm user authenticated
    if (!user) {
        throw new Error("User not authenticated");
    }
    user.painConditions = painConditions;
    console.log(painConditions);
    router.push("/(auth)/(onboarding)/miscconditions");
  };

  // adds or removes a condition from the array depending on if it's was previously in the list or not
  // TODO: add visual effect to indicate this
  const toggleCondition = (condition: string) => {
    if (painConditions.includes(condition)) {
        // create array of items that do not contain the condition
        setPainConditions(painConditions.filter(item => item !== condition));
        console.log("removed", condition);
        console.log(painConditions); // logs are wrong sometimes idk why T_T
    } else {
        setPainConditions(painConditions.concat(condition));
        console.log("added", condition);
        console.log(painConditions);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.content}>
            <View style={styles.header}>
            <Text style={styles.title}>Tell us about the musculosketal or chronic pain you're experiencing</Text>
            <Text> You can select multiple conditions</Text>
            </View>
            <ScrollView style={styles.scroll}>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[0])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[1])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[1]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[2])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[2]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[3])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[3]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[4])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[4]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[5])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[5]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[6])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[6]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[7])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[7]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[8])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[8]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[9])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[9]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[10])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[10]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[11])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[11]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[12])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[12]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[13])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[13]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[14])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[14]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[15])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[15]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[16])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[16]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[17])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[17]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[18])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[18]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[19])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[19]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[20])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[20]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[21])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[21]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleCondition(painConditionsOptions[22])}>
                    <Text style={styles.buttonText}>{painConditionsOptions[22]}</Text>
                </TouchableOpacity>
            </ScrollView>        
            
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
        flex: 1,
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
    scroll: {
        width: '100%',
        flex: 1,
        paddingBottom: 20,
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