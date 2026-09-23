import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity, 
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from '@/context/authcontext';
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";

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
  const { user, updateUser, updateUserDraft } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // pop-up to edit a detail
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState('');

  const handleUpdateName = async () => {
    if (!user) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        name: trimmedName 
      });
      // update supabase
      await updateUser({
        name: user.name,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowEdit(!showEdit);
    }
  }

  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="PROFILE"
        title="Edit your profile"
        description="Edit your information or update your security details"
      />
      
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowEdit(!showEdit)}>
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
      
      <Modal 
        visible={showEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Name</Text>
            <AuthInput
              label="Name"
              placeholder={user?.name}
              inputMode="text"
              autoCapitalize="words"
              autoCorrect={false}
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleUpdateName}
              editable={!isLoading}
            />
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowEdit(!showEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateName}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  centredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInterface: {
    backgroundColor: 'white',
    margin: 20,
    padding: 50,
    paddingLeft: 100,
    paddingRight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 20,
  },
  buttonOptions: {
    flexDirection: 'row',
    paddingTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonCancel: {
    backgroundColor: palette.line,
  },
  buttonSave: {
    backgroundColor: palette.primary,
  },
})