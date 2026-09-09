import { useState } from "react";
import { 
    Text, 
    TextInput,
    View, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// login screen for existing user
// TODO: integrate UI from front-end branch

export default function Login() {
    // keep track of what user typing
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");

    // routing info
    const router = useRouter();
    
    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}> 
                <View style={styles.content}>
                    <Text style={styles.title}>SIGN IN</Text>
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
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>LOGIN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.link} onPress={() => router.push("/(auth)/signup")}>
                            <Text style={styles.linkText}>Sign up</Text>
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
