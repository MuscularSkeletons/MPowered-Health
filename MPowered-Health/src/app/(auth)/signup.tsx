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
import { Ionicons } from "@expo/vector-icons";
import { toUserError, type AuthUserError } from "@/constants/profile/autherror";
import { palette } from "@/constants/profile/ui";

// login screen for existing user
// TODO: integrate UI from front-end branch

export default function Signup() {
    // keep track of what user typing
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // confirm password
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isEqualPasswords = confirmPassword === password;

    const [isLoading, setIsLoading] = useState(false); // keep track of loading state

    // routing info
    const router = useRouter();
    const { signUp, user, updateUser } = useAuth();

    // error handling
    const [authError, setAuthError] = useState<AuthUserError | null>(null);

    // validate sign in
    const handleSignUp = async () => {
        // any field empty
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // check wrote same password twice
        if (password !== confirmPassword) {
            Alert.alert("Error", "Please enter the same password");
            return;
        }
        
        setIsLoading(true);
        setAuthError(null);

        try {
            await signUp(email, password);
            router.replace("/(auth)/confirmation");
        } catch (error) {
            // handle errors
            console.log(error);
            const userError = toUserError(error);
            setAuthError(userError);
            Alert.alert("Error", userError.message); // better to do alert message or just show text?
            return;
        } finally {
            setIsLoading(false);
        }
    };

    // toggle password visibility
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // toggle confirm password visibility
    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}> 
                <View style={styles.content}>
                    <Text style={styles.title}>SIGN UP</Text>
                    {/*display authentication error
                    <Text>{authError?.message}</Text>*/}
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
                            placeholder="Password"
                            placeholderTextColor={"#999"}
                            keyboardType="default"
                            inputMode="text"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            style={styles.input}
                        />
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#aaa"
                            style={styles.icon}
                            onPress={toggleShowPassword}
                        />
                        <Text>Confirm Password</Text>
                        <TextInput 
                            placeholder="Confirm Password"
                            placeholderTextColor={"#999"}
                            keyboardType="default"
                            inputMode="text"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            style={styles.input}
                        />
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#aaa"
                            style={styles.icon}
                            onPress={toggleShowConfirmPassword}
                        />
                        {/*when confirming password, display text if password not the same */}
                        {(confirmPassword && !isEqualPasswords) ? (
                            <Text>Passwords are not equal</Text>
                        ) : (
                            <Text></Text>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            {/*if loading, replace button with loading indicator */}
                            {isLoading ? (
                                <ActivityIndicator size={24} color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>SIGNUP</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.link} onPress={() => router.push("/(auth)/login")}>
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
    icon: {
        marginLeft: 10,
    },
    errorMsg: {
        color: palette.error,
    },
});
