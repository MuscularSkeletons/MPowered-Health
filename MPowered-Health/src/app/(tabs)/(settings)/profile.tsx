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
import { toUserError, type AuthUserError } from '@/constants/profile/autherror';
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";
import { BIRTH_YEAR_RANGE } from '@/constants/profile/profile-constants';
import { sexOptions, diagnosisOptions, painConditionsOptions } from '@/constants/profile/profile-options';

// temporary UI reusing auth ui
import {
  AuthInput,
  AuthIntro,
  AuthScreen,
  PrimaryButton,
  authStyles,
  ChoiceButton,
} from '@/components/auth/auth-ui';
import { ScrollView } from 'react-native';


export default function ManageProfile() {
  const router = useRouter();
  const { user, updateUser, updateUserDraft, updateAuthUserEmail, updateAuthUserPassword } = useAuth();
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
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        name: trimmedName 
      });
      // update supabase
      await updateUser({
        name: trimmedName,
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
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        birthsex: birthsex 
      });
      // update supabase
      await updateUser({
        birthsex: birthsex,
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
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        birthyear: numericBirthYear 
      });
      // update supabase
      await updateUser({
        birthyear: numericBirthYear,
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
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        formalDiagnosis: hasDiagnosis, 
      });
      // update supabase
      await updateUser({
        formalDiagnosis: hasDiagnosis,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowDiagnosisEdit(!showDiagnosisEdit);
    }
  }

  // edit conditions
  const [showConditionsEdit, setShowConditionsEdit] = useState(false);
  const [painConditions, setPainConditions] = useState<string[]>([]);

  const toggleCondition = (condition: string) => {
    setPainConditions((selected) =>
      selected.includes(condition)
        ? selected.filter((item) => item !== condition)
        : [...selected, condition].sort(),
    );
  };
  const handleUpdateConditions = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        painConditions: painConditions,
      });
      // update supabase
      await updateUser({
        painConditions: painConditions,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowConditionsEdit(!showConditionsEdit);
    }
  };

  // edit other conditions
  const [showOtherConditionEdit, setShowOtherConditionEdit] = useState(false);
  const [otherCondition, setOtherCondition] = useState('');

  const handleUpdateOtherCondition = async () => {
    if (!user) {
      return;
    }
    const trimmedOtherCondition = otherCondition.trim();
    let updatedOtherCondition: string | null;
    if (!trimmedOtherCondition) {
      console.log("Setting other condition to null");
      updatedOtherCondition = null;
    } else {
      updatedOtherCondition = trimmedOtherCondition;
    }
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // update locally
      updateUserDraft({ 
        otherCondition: updatedOtherCondition,
      });      
      // update supabase
      await updateUser({
        otherCondition: updatedOtherCondition,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowOtherConditionEdit(!showOtherConditionEdit);
    }
  };

  // update authentication info
  const [authError, setAuthError] = useState<AuthUserError | null>(null);

  // update email
  /* NOTE: when testing email update, a confirmation email is sent to the new email. please enter a valid email address
    to reduce the number of bounced emails sent.
    Confirmation link currently redirects to a site (TODO: implement deep linking when do email verification)
    if you don't click confirm, you can check if the email has been updated in the email_change field in
    supabase. once confirmed it will update in the email field. updating to the UI may be delayed.
  */
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [email, setEmail] = useState('');  
  
  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await updateAuthUserEmail(email.trim());
      // close modal
      setShowEmailEdit(!showEmailEdit);
      Alert.alert('A confirmation email has been sent to ' + email.trim() + '. Please confirm the address to update your email.');
    } catch (error) {
      const userError = toUserError(error);
      setAuthError(userError);
      Alert.alert('Error', userError.message);
    } finally {
      setIsLoading(false);
    }
  };

  // update password
  const [showCurrPasswordEdit, setShowCurrPasswordEdit] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await updateAuthUserPassword(currPassword, newPassword);
      // for debugging purposes - to delete
      console.log("Password updated to", newPassword);
      // close modal
      setShowCurrPasswordEdit(!showCurrPasswordEdit);
    } catch (error) {
      const userError = toUserError(error);
      setAuthError(userError);
      Alert.alert('Error', userError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="PROFILE"
        title="Edit your profile"
        description="Edit your information or update your security details"
      />
      
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => { 
          setName(user?.name ?? ''); 
          setShowNameEdit(!showNameEdit);
        }}>
        <Text style={styles.settingLabel}>{user?.name || "No Name"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => {
          setBirthsex(user?.birthsex ?? '');
          setShowBirthsexEdit(!showBirthsexEdit);
        }}>
        <Text style={styles.settingLabel}>{user?.birthsex || "Prefer not to say"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => {
          setBirthYear(user?.birthyear?.toString() ?? '');
          setShowBirthYearEdit(!showBirthYearEdit);
        }}>
        <Text style={styles.settingLabel}>{user?.birthyear || "No birth year"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => {
          setHasDiagnosis(user?.formalDiagnosis ?? null);
          setShowDiagnosisEdit(!showDiagnosisEdit);
        }}>
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
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => {
          setPainConditions(user?.painConditions ?? []);
          setShowConditionsEdit(!showConditionsEdit);
        }}>
        <Text style={styles.settingLabel}>Edit Conditions</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} 
        onPress={() => {
          setOtherCondition(user?.otherCondition ?? '');
          setShowOtherConditionEdit(!showOtherConditionEdit);
        }}>
        <Text style={styles.settingLabel}>{user?.otherCondition || "No other condition"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}
        onPress={() => {
          setEmail(user?.email ?? '');
          setShowEmailEdit(!showEmailEdit);
        }}>
        <Text style={styles.settingLabel}>{user?.email || "No email"}</Text>
        <Ionicons 
            name={"create-outline"}
            style={styles.settingValue}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}
        onPress={() => {
          setShowCurrPasswordEdit(!showCurrPasswordEdit);
        }}>
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

      <Modal 
        visible={showConditionsEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Conditions</Text>
            <ScrollView>
            <View style={authStyles.choices}>
              {painConditionsOptions.map((condition) => (
                <ChoiceButton
                  key={condition}
                  label={condition}
                  multiple
                  selected={painConditions.includes(condition)}
                  onPress={() => toggleCondition(condition)}
                />
              ))}
            </View>
            </ScrollView>
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowConditionsEdit(!showConditionsEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateConditions}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showOtherConditionEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Other Conditions</Text>
            <AuthInput
              label="Other conditions"
              placeholder={user?.otherCondition || 'Type conditions or symptoms'}
              inputMode="text"
              autoCorrect
              value={otherCondition}
              onChangeText={setOtherCondition}
              onSubmitEditing={handleUpdateOtherCondition}
            />
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowOtherConditionEdit(!showOtherConditionEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateOtherCondition}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showEmailEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Edit Email</Text>
            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setAuthError(null);
              }}
            />
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowEmailEdit(!showEmailEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdateEmail}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showCurrPasswordEdit} 
        transparent={true} 
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Update your password</Text>
            <Text>Please enter your existing password and your new password.</Text>
            <AuthInput
              label="Current password"
              placeholder="Enter your current password password"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              value={currPassword}
              onChangeText={(value) => {
                setCurrPassword(value);
                setAuthError(null);
              }}
              secure
              reveal={showCurrPassword}
              onToggleReveal={() => setShowCurrPassword((visible) => !visible)}
            />
            <AuthInput
              label="New password"
              placeholder="Enter a new password"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!isLoading}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setAuthError(null);
              }}
              secure
              reveal={showNewPassword}
              onToggleReveal={() => setShowNewPassword((visible) => !visible)}
              onSubmitEditing={() => void handleUpdatePassword()}
            />
            {authError ? (
              <Text accessibilityRole="alert" style={authStyles.error}>
                {authError.message}
              </Text>
            ) : null}
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowCurrPasswordEdit(!showCurrPasswordEdit)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable  style={[styles.button, styles.buttonSave]} onPress={handleUpdatePassword}>
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