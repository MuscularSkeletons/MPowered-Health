import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity, 
  Modal,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  authStyles,
  ChoiceButton,
} from '@/components/auth/auth-ui';

function ModalActions({
  isSaving,
  onCancel,
  onSave,
}: {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.buttonOptions}>
      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={onCancel}
        style={({ pressed }) => [
          styles.button,
          styles.buttonCancel,
          pressed && !isSaving && styles.buttonPressed,
          isSaving && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonCancelText}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSaving, disabled: isSaving }}
        disabled={isSaving}
        onPress={onSave}
        style={({ pressed }) => [
          styles.button,
          styles.buttonSave,
          pressed && !isSaving && styles.buttonPressed,
          isSaving && styles.buttonSaving,
        ]}
      >
        {isSaving ? (
          <View style={styles.savingContent}>
            <ActivityIndicator size="small" color={palette.text} />
            <Text style={styles.buttonSaveText}>Saving…</Text>
          </View>
        ) : (
          <Text style={styles.buttonSaveText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}

function ProfileRow({
  label,
  value,
  onPress,
  last = false,
}: {
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label.toLowerCase()}`}
      activeOpacity={0.68}
      onPress={onPress}
      style={[styles.settingItem, last && styles.settingItemLast]}
    >
      <View style={styles.settingCopy}>
        <Text style={styles.settingMeta}>{label}</Text>
        <Text style={styles.settingLabel} numberOfLines={2}>{value}</Text>
      </View>
      <View style={styles.editIcon}>
        <Ionicons name="pencil-outline" size={17} color={palette.primaryDark} />
      </View>
    </TouchableOpacity>
  );
}


export default function ManageProfile() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const openedFromSettings = edit === 'password';
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
      setShowNameEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your name was not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
      setShowBirthsexEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your sex was not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
      setShowBirthYearEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your year of birth was not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
      setShowDiagnosisEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your diagnosis status was not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
      setShowConditionsEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your pain conditions were not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
    updatedOtherCondition = trimmedOtherCondition || null;
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
      setShowOtherConditionEdit(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to save', 'Your other condition was not updated. Please try again.');
    } finally {
      setIsLoading(false);
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
      setShowEmailEdit(false);
      Alert.alert(
        'Check your email',
        `We sent a confirmation link to ${email.trim()}. Open it to finish updating your email address.`,
      );
    } catch (error) {
      const userError = toUserError(error);
      setAuthError(userError);
      Alert.alert('Error', userError.message);
    } finally {
      setIsLoading(false);
    }
  };

  // update password
  const [showCurrPasswordEdit, setShowCurrPasswordEdit] = useState(openedFromSettings);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const closePasswordEditor = () => {
    setShowCurrPasswordEdit(false);
    setAuthError(null);
    setCurrPassword('');
    setNewPassword('');
    if (openedFromSettings) {
      router.back();
    }
  };

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
      setCurrPassword('');
      setNewPassword('');
      setShowCurrPasswordEdit(false);
      if (openedFromSettings) {
        router.back();
      }
      Alert.alert('Password updated', 'Your password has been changed successfully.');
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
        title="Profile details"
        description="Keep your personal and health information up to date."
      />

      <Text style={[styles.groupLabel, styles.firstGroupLabel]}>PERSONAL DETAILS</Text>
      <View style={styles.settingsGroup}>
        <ProfileRow
          label="NAME"
          value={user?.name || 'Not provided'}
          onPress={() => {
            setName(user?.name ?? '');
            setShowNameEdit(true);
          }}
        />
        <ProfileRow
          label="SEX"
          value={user?.birthsex || 'Prefer not to say'}
          onPress={() => {
            setBirthsex(user?.birthsex ?? '');
            setShowBirthsexEdit(true);
          }}
        />
        <ProfileRow
          label="YEAR OF BIRTH"
          value={user?.birthyear?.toString() || 'Not provided'}
          last
          onPress={() => {
            setBirthYear(user?.birthyear?.toString() ?? '');
            setShowBirthYearEdit(true);
          }}
        />
      </View>

      <Text style={styles.groupLabel}>HEALTH INFORMATION</Text>
      <View style={styles.settingsGroup}>
        <ProfileRow
          label="DIAGNOSIS"
          value={
            user?.formalDiagnosis === true
              ? 'Formal diagnosis recorded'
              : user?.formalDiagnosis === false
                ? 'No formal diagnosis'
                : 'Not provided'
          }
          onPress={() => {
            setHasDiagnosis(user?.formalDiagnosis ?? null);
            setShowDiagnosisEdit(true);
          }}
        />
        <ProfileRow
          label="PAIN CONDITIONS"
          value={user?.painConditions?.length ? user.painConditions.join(', ') : 'None selected'}
          onPress={() => {
            setPainConditions(user?.painConditions ?? []);
            setShowConditionsEdit(true);
          }}
        />
        <ProfileRow
          label="OTHER CONDITION"
          value={user?.otherCondition || 'None added'}
          last
          onPress={() => {
            setOtherCondition(user?.otherCondition ?? '');
            setShowOtherConditionEdit(true);
          }}
        />
      </View>

      <Text style={styles.groupLabel}>ACCOUNT DETAILS</Text>
      <View style={styles.settingsGroup}>
        <ProfileRow
          label="EMAIL ADDRESS"
          value={user?.email || 'Not provided'}
          last
          onPress={() => {
            setEmail(user?.email ?? '');
            setShowEmailEdit(true);
          }}
        />
      </View>
      <Modal 
        visible={showNameEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit name</Text>
            <AuthInput
              testID="name-input"
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowNameEdit(false)}
              onSave={() => void handleUpdateName()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showBirthsexEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit sex</Text>
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowBirthsexEdit(false)}
              onSave={() => void handleUpdateBirthsex()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showBirthYearEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit year of birth</Text>
            <AuthInput
              testID="birth-year-input"
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowBirthYearEdit(false)}
              onSave={() => void handleUpdateBirthYear()}
            />
          </View>
        </View>
      </Modal>
      
      <Modal 
        visible={showDiagnosisEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit diagnosis</Text>
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowDiagnosisEdit(false)}
              onSave={() => void handleUpdateDiagnosis()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showConditionsEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit pain conditions</Text>
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowConditionsEdit(false)}
              onSave={() => void handleUpdateConditions()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showOtherConditionEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Edit other condition</Text>
            <AuthInput
              testID="other-conditions-input"
              label="Other condition"
              placeholder={user?.otherCondition || 'Type conditions or symptoms'}
              inputMode="text"
              autoCorrect
              value={otherCondition}
              onChangeText={setOtherCondition}
              onSubmitEditing={handleUpdateOtherCondition}
              editable={!isLoading}
            />
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowOtherConditionEdit(false)}
              onSave={() => void handleUpdateOtherCondition()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showEmailEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Change email address</Text>
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
            <ModalActions
              isSaving={isLoading}
              onCancel={() => setShowEmailEdit(false)}
              onSave={() => void handleUpdateEmail()}
            />
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showCurrPasswordEdit} 
        transparent={true} 
        animationType="fade"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text style={styles.modalTitle}>Change password</Text>
            <Text style={styles.modalDescription}>Confirm your current password, then choose a new one.</Text>
            <AuthInput
              label="Current password"
              placeholder="Enter your current password"
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
            <ModalActions
              isSaving={isLoading}
              onCancel={closePasswordEditor}
              onSave={() => void handleUpdatePassword()}
            />
          </View>
        </View>
      </Modal>

    </AuthScreen>
  
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    marginTop: 22,
    marginBottom: 9,
    marginLeft: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.05,
    color: palette.muted,
  },
  firstGroupLabel: { marginTop: 0 },
  settingsGroup: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: palette.text,
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 76,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  settingItemLast: { borderBottomWidth: 0 },
  settingCopy: { flex: 1, paddingRight: 14 },
  settingMeta: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: palette.muted,
    marginBottom: 3,
  },
  settingLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: palette.text,
  },
  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(58,48,53,0.48)',
  },
  editInterface: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: palette.surface,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: palette.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
    borderRadius: 24,
  },
  modalTitle: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: palette.text, marginBottom: 8 },
  modalDescription: { fontSize: 13, lineHeight: 20, color: palette.muted, marginBottom: 8 },
  buttonOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingTop: 22,
  },
  button: {
    minWidth: 96,
    minHeight: 46,
    borderRadius: 23,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  buttonSave: {
    backgroundColor: palette.primary,
    flex: 1,
    maxWidth: 220,
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.45 },
  buttonSaving: { backgroundColor: palette.disabledBackground, shadowOpacity: 0, elevation: 0 },
  savingContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonCancelText: { color: palette.text, fontWeight: '800' },
  buttonSaveText: { color: palette.text, fontWeight: '800' },
})
