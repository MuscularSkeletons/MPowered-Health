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

// TODO: implement notifications in separate sprint if have time to do
export default function ManageNotifications() {
  const router = useRouter();
  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="NOTIFICATIONS"
        title=""
        description="Manage the timing and frequency of your locations"
      />
    </AuthScreen>
  );
}


