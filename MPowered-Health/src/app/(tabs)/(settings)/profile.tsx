import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
// temporary UI reusing auth ui
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';


export default function ManageProfile() {
  const router = useRouter();
  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="PROFILE"
        title="Edit your profile"
        description="Edit your information or update your security details"
      />
      <Text>Edit Name</Text>
      <Text>Edit Diagnosis</Text>
      <Text>Edit Conditions</Text>
    </AuthScreen>
  );
}
