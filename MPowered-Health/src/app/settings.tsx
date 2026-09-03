import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteLocalAccount, getProfile, Profile } from '@/constants/account';
import { MhaHeader, palette } from '@/components/mha-ui';

function ProfileIcon() {
  return (
    <View style={s.profileIcon} accessibilityElementsHidden>
      <View style={s.profileHead} />
      <View style={s.profileBody} />
    </View>
  );
}

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

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
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
  const deleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
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
          <View style={s.headingDot} />
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
            description="Manage how your information is used"
            onPress={() =>
              router.push({
                pathname: '/workflow',
                params: { flow: 'settings', returnTo: '/settings' },
              })
            }
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
          if (!deleting) setConfirmDelete(false);
        }}
      >
        <View style={s.backdrop}>
          <View style={s.dialog}>
            <View style={s.dialogIcon}>
              <Text style={s.dialogIconText}>!</Text>
            </View>
            <Text style={s.dialogTitle}>Delete account?</Text>
            <Text style={s.dialogCopy}>
              This permanently removes your profile, saved reflections, assessments, prescriptions,
              and appointments from this device.
            </Text>
            <Text style={s.dialogNote}>
              This cannot be undone. The app currently stores account data on this device only.
            </Text>
            {deleteError ? (
              <Text accessibilityLiveRegion="polite" style={s.error}>
                {deleteError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={() => setConfirmDelete(false)}
            >
              <Text style={s.cancel}>Keep my account</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              style={s.deleteButton}
              onPress={deleteAccount}
            >
              <Text style={s.deleteText}>
                {deleting ? 'Deleting…' : 'Delete account permanently'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 112,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: palette.primary,
    marginBottom: 7,
  },
  title: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1,
    color: palette.text,
  },
  headingDot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: palette.light,
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#E9DEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'flex-end' },
  profileHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: palette.primary,
    position: 'absolute',
    top: 1,
  },
  profileBody: {
    width: 25,
    height: 14,
    borderRadius: 14,
    backgroundColor: palette.primary,
    position: 'absolute',
    bottom: 1,
  },
  profileCopy: { flex: 1, marginLeft: 14 },
  greeting: { fontSize: 11, fontWeight: '700', color: '#D8C7FA', marginBottom: 3 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileEmail: { fontSize: 12, lineHeight: 17, color: '#E9DEFF', marginTop: 3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A8F0C8', marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.muted,
    marginTop: 28,
    marginBottom: 9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: '#342052',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dangerCard: { borderColor: '#F1D9DF', backgroundColor: '#FFFDFD' },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowPressed: { opacity: 0.65 },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FBE8EC' },
  rowIconText: { fontSize: 21, fontWeight: '700', color: palette.primary },
  rowIconTextDanger: { color: palette.error },
  rowCopy: { flex: 1, marginLeft: 13, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: palette.text },
  rowDescription: { fontSize: 12, lineHeight: 17, color: palette.muted, marginTop: 3 },
  chevron: { fontSize: 27, lineHeight: 28, color: '#9A90A7', fontWeight: '300' },
  dangerText: { color: palette.error },
  divider: { height: 1, backgroundColor: '#EEEAF4', marginLeft: 55 },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 34,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(32,26,43,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: { width: '100%', maxWidth: 460, borderRadius: 26, padding: 24, backgroundColor: '#fff' },
  dialogIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FBE8EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dialogIconText: { fontSize: 22, fontWeight: '900', color: palette.error },
  dialogTitle: { fontSize: 25, fontWeight: '800', color: palette.text },
  dialogCopy: { fontSize: 14, lineHeight: 21, color: palette.muted, marginTop: 13 },
  dialogNote: { fontSize: 12, lineHeight: 18, color: palette.muted, marginTop: 10 },
  error: { color: palette.error, fontSize: 12, marginTop: 12 },
  cancel: { textAlign: 'center', color: palette.primary, fontWeight: '800', padding: 17 },
  deleteButton: { backgroundColor: palette.error, borderRadius: 17, padding: 16 },
  deleteText: { textAlign: 'center', color: '#fff', fontWeight: '800' },
});
