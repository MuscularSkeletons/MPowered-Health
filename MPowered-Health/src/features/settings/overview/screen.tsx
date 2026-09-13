import { s } from '@/features/settings/overview/styles';
// This screen provides account, privacy, data export, and deletion settings.
import { deleteLocalAccount, getProfile, Profile } from '@/features/account/repository';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Small local components keep the settings rows consistent and easy to scan.
// Keep the profile picture placeholder separate from the settings list.
function ProfileIcon() {
  return (
    <View style={s.profileIcon} accessibilityElementsHidden>
      <View style={s.profileHead} />
      <View style={s.profileBody} />
    </View>
  );
}

// Reuse one row layout for every settings destination.
function SettingRow({
  icon,
  title,
  description,
  onPress,
  danger = false,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
    >
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Text style={[s.rowIconText, danger && s.rowIconTextDanger]}>{icon}</Text>
      </View>
      <View style={s.rowCopy}>
        <Text style={[s.rowTitle, danger && s.dangerText]}>{title}</Text>
        <Text style={s.rowDescription}>{description}</Text>
      </View>
      <Text style={[s.chevron, danger && s.dangerText]}>›</Text>
    </Pressable>
  );
}

// Load account details, open settings pages, and handle local deletion.
export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'warning' | 'email'>('warning');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // Read the latest stored profile when the screen first opens.
  useEffect(() => {
    let active = true;
    getProfile()
      .then((saved) => {
        if (active) setProfile(saved);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, []);
  // Block duplicate presses and close the modal only after deletion succeeds.
  const deleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const currentProfile = await getProfile();
      if (
        !currentProfile ||
        verificationEmail.trim().toLowerCase() !== currentProfile.email.trim().toLowerCase()
      ) {
        setDeleteError('Enter the email address linked to this account.');
        setDeleting(false);
        return;
      }
      await deleteLocalAccount();
      router.replace('/splash');
    } catch {
      setDeleteError('Deletion could not be completed. Please try again.');
      setDeleting(false);
    }
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.headingRow}>
          <View>
            <Text style={s.eyebrow}>YOUR ACCOUNT</Text>
            <Text style={s.title}>Settings</Text>
          </View>
        </View>
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <ProfileIcon />
          </View>
          <View style={s.profileCopy}>
            <Text style={s.greeting}>Your MPowered profile</Text>
            <Text style={s.profileName}>{profile?.name || 'Complete your profile'}</Text>
            <Text style={s.profileEmail}>
              {profile?.email || 'Add your details to personalise your plan'}
            </Text>
          </View>
          <View style={s.statusPill}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>Active</Text>
          </View>
        </View>
        <Text style={s.sectionLabel}>PROFILE &amp; PREFERENCES</Text>
        <View style={s.card}>
          <SettingRow
            icon="♙"
            title="Edit profile"
            description="Update your onboarding answers and personal details"
            onPress={() => router.push('/personal-details')}
          />
          <View style={s.divider} />
          <SettingRow
            icon="⌁"
            title="Privacy &amp; permissions"
            description="See how your information is handled and what the app can access"
            onPress={() => router.push('/privacy-permissions')}
          />
        </View>
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.card}>
          <SettingRow
            icon="↪"
            title="Sign out"
            description="Sign out of this device"
            onPress={() => router.replace('/splash')}
          />
        </View>
        <Text style={s.sectionLabel}>DANGER ZONE</Text>
        <View style={[s.card, s.dangerCard]}>
          <SettingRow
            icon="⌫"
            title="Delete account"
            description="Permanently remove your local profile and health data"
            danger
            onPress={() => {
              setDeleteError('');
              setDeleteStep('warning');
              setVerificationEmail('');
              setConfirmDelete(true);
            }}
          />
        </View>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
      <Modal
        visible={confirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) {
            setConfirmDelete(false);
            setVerificationEmail('');
          }
        }}
      >
        <View style={s.backdrop}>
          <View style={s.dialog}>
            <View style={s.dialogIcon}>
              <Text style={s.dialogIconText}>!</Text>
            </View>
            <Text style={s.dialogTitle}>
              {deleteStep === 'warning' ? 'Delete My Account?' : 'Verify your email address'}
            </Text>
            {deleteStep === 'warning' ? (
              <>
                <Text style={s.dialogCopy}>
                  This permanently removes your profile, saved reflections, assessments,
                  prescriptions, and appointments from this device.
                </Text>
                <Text style={s.dialogNote}>Deleting the account cannot be undone.</Text>
              </>
            ) : (
              <>
                <Text style={s.dialogCopy}>
                  Enter the email address linked to your account before it is permanently deleted.
                </Text>
                <Text style={s.inputLabel}>Email address</Text>
                <TextInput
                  accessibilityLabel="Email address for account deletion"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!deleting}
                  inputMode="email"
                  keyboardType="email-address"
                  maxLength={254}
                  onChangeText={(value) => {
                    setVerificationEmail(value);
                    setDeleteError('');
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#81798A"
                  style={s.input}
                  value={verificationEmail}
                />
              </>
            )}
            {deleteError ? (
              <Text accessibilityLiveRegion="polite" style={s.error}>
                {deleteError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={() => {
                setConfirmDelete(false);
                setVerificationEmail('');
              }}
            >
              <Text style={s.cancel}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleting || (deleteStep === 'email' && !verificationEmail.trim())}
              style={[
                s.deleteButton,
                (deleting || (deleteStep === 'email' && !verificationEmail.trim())) &&
                  s.deleteButtonDisabled,
              ]}
              onPress={() => {
                if (deleteStep === 'warning') {
                  setDeleteStep('email');
                  setDeleteError('');
                } else {
                  void deleteAccount();
                }
              }}
            >
              <Text style={s.deleteText}>
                {deleting
                  ? 'Deleting…'
                  : deleteStep === 'warning'
                    ? 'Confirm'
                    : 'Verify and delete'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Keep settings, modal, and account styles together below the behavior.
