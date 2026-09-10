import { useState } from "react";
import { 
    Text, 
    TextInput,
    View, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authcontext";
import { supabase } from "@/lib/supabase/client";

// login screen for existing user
// TODO: integrate UI from front-end branch

export default function Signup() {
    // keep track of what user typing
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false); // keep track of loading state

    // routing info
    const router = useRouter();
    const { signUp, user, updateUser } = useAuth();

    // validate sign in
    const handleSignUp = async () => {
        // any field empty
        if (!email || !pin) {
            Alert.alert("Error", "Please fill in all fields");
        }

        // TODO: implement more validation rules (e.g., email format, pin length, etc.)
        // note: when testing, email must be in correct format and password nust be at least 6 characters long

        setIsLoading(true);
        try {
            // check email unique
            const { data: existingUser } = await supabase.from("User").select("email").eq("email", email).single();
            if (existingUser) {
                Alert.alert(
                    "Error",
                    "Email already exists. Please use a different email.",
                );
                setIsLoading(false);
                return;
            }

            await signUp(email, pin);
            
            // store email and pin
            await updateUser({
                email,
            });

            router.push("/(auth)/(onboarding)/onboarding");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to sign up. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}> 
                <View style={styles.content}>
                    <Text style={styles.title}>SIGN UP</Text>
                    <View style={styles.form}>
                        <TextInput 
                            placeholder="Email"
                            placeholderTextColor={"#999"}
                            keyboardType="email-address"
                            inputMode="email"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />
                        <TextInput 
                            placeholder="PIN"
                            placeholderTextColor={"#999"}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            value={pin}
                            onChangeText={setPin}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            {/*if loading, replace button with loading indicator */}
                            {isLoading ? (
                                <ActivityIndicator size={24} color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>SIGNUP</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.link}>
                            <Text style={styles.linkText}>Log in to a different account</Text>
                        </TouchableOpacity>
                    </View>


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
    link: {
        alignSelf: 'flex-end', 
        paddingVertical: 11, 
        paddingLeft: 16
    },
    linkText: {
        fontSize: 13,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
