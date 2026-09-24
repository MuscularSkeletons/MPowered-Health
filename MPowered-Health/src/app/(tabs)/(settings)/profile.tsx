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
import { BIRTH_YEAR_RANGE } from '@/constants/profile/profile-constants';
import { sexOptions, diagnosisOptions } from '@/constants/profile/profile-options';

// temporary UI reusing auth ui
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
  ChoiceButton,
} from '@/components/auth/auth-ui';


export default function ManageProfile() {
  const router = useRouter();
  const { user, updateUser, updateUserDraft } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // pop-up to edit a detail
  // edit name
  const [showNameEdit, setShowNameEdit] = useState(false);
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
      setShowNameEdit(!showNameEdit);
    }
  }

  // edit birth sex
  const [showBirthsexEdit, setShowBirthsexEdit] = useState(false);
  const [birthsex, setBirthsex] = useState('');
  const handleUpdateBirthsex = async () => {
    if (!user) {
      return;
    }
    if (!birthsex) {
      Alert.alert('Error', 'Please select an option');
      return;
    }
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        birthsex: birthsex 
      });
      // update supabase
      await updateUser({
        birthsex: user.birthsex,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowBirthsexEdit(!showBirthsexEdit);
    }
  }

  // edith birth year
  const [showBirthYearEdit, setShowBirthYearEdit] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const handleUpdateBirthYear = async () => {
    if (!user) {
      return;
    }
    const numericBirthYear = Number(birthYear);
    if (
      !/^\d{4}$/.test(birthYear) ||
      numericBirthYear < BIRTH_YEAR_RANGE.LOWER_BOUND ||
      numericBirthYear > BIRTH_YEAR_RANGE.UPPER_BOUND
    ) {
      Alert.alert('Error', 'Please enter a valid four-digit year');
      return;
    }
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        birthyear: numericBirthYear 
      });
      // update supabase
      await updateUser({
        birthyear: user.birthyear,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowBirthYearEdit(!showBirthYearEdit);
    }
  }

  // edit diagnosis status
  const [showDiagnosisEdit, setShowDiagnosisEdit] = useState(false);
  const [hasDiagnosis, setHasDiagnosis] = useState<boolean | null>(null);
  const handleUpdateDiagnosis = async () => {
    if (hasDiagnosis === null) {
      Alert.alert('Error', 'Please select an option');
      return;
    }
    console.log("diagnosis", hasDiagnosis);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        formalDiagnosis: hasDiagnosis 
      });
      console.log("draft diagnosis", user.formalDiagnosis);
      // update supabase
      await updateUser({
        formalDiagnosis: user.formalDiagnosis,
      });
      console.log("Updated diagnosis", user.formalDiagnosis);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowDiagnosisEdit(!showDiagnosisEdit);
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
      
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowNameEdit(!showNameEdit)}>
        <Text style={styles.settingLabel}>{user?.name || "No Name"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowBirthsexEdit(!showBirthsexEdit)}>
        <Text style={styles.settingLabel}>{user?.birthsex || "Prefer not to say"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowBirthYearEdit(!showBirthYearEdit)}>
        <Text style={styles.settingLabel}>{user?.birthyear || "No birth year"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowDiagnosisEdit(!showDiagnosisEdit)}>
        {user?.formalDiagnosis === true ?
        <Text style={styles.settingLabel}>Have formal diagnosis</Text> :
        user?.formalDiagnosis === false ?
        <Text style={styles.settingLabel}>Have no formal diagnosis</Text> :
        <Text style={styles.settingLabel}>No diagnosis given</Text>}
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
        <Text style={styles.settingLabel}>Edit Other Conditions</Text>
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
        visible={showNameEdit} 
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
                onPress={() => setShowNameEdit(!showNameEdit)}
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

      <Modal 
        visible={showBirthsexEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Birth Sex</Text>
            <View style={authStyles.choices}>
              {sexOptions.map((option) => (
                <ChoiceButton
                  key={option}
                  label={option}
                  selected={birthsex === option}
                  onPress={() => setBirthsex(option)}
                />
              ))}
            </View>
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowBirthsexEdit(!showBirthsexEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateBirthsex}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showBirthYearEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Birth Year</Text>
            <AuthInput
              label="Year of birth"
              placeholder={String(user?.birthyear || "XXXX")}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={4}
              value={birthYear}
              onChangeText={(value) => setBirthYear(value.replace(/\D/g, '').slice(0, 4))}
              onSubmitEditing={handleUpdateBirthYear}
              editable={!isLoading}
            />
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowBirthYearEdit(!showBirthYearEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateBirthYear}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal 
        visible={showDiagnosisEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Diagnosis</Text>
            <View style={authStyles.choices}>
              <ChoiceButton
                label={diagnosisOptions[0]}
                selected={hasDiagnosis === true}
                onPress={() => setHasDiagnosis(true)}
              />
              <ChoiceButton
                label={diagnosisOptions[1]}
                selected={hasDiagnosis === false}
                onPress={() => setHasDiagnosis(false)}
              />
            </View>
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowDiagnosisEdit(!showDiagnosisEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateDiagnosis}>
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
    margin: 10,
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