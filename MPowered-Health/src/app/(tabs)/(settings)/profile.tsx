import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity, 
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from '@/context/authcontext';
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/profile/ui";

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
  const { user, updateUser } = useAuth();

  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="PROFILE"
        title="Edit your profile"
        description="Edit your information or update your security details"
      />

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingLabel}>{user?.name || "No Name"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingLabel}>{user?.formalDiagnosis || "No diagnosis given"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingLabel}>Edit Conditions</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingLabel}>{user?.email || "No email"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingLabel}>Change password</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 20,
    color: palette.success,
  },
  settingValue: {
    fontSize: 25,
    color: palette.success,
  },
})