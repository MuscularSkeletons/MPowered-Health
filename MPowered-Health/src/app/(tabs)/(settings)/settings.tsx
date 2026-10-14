import { 
  Text, 
  View, 
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync } from 'expo-web-browser';
import { AuthIntro, AuthScreen } from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';

function SettingRow({
  icon,
  title,
  description,
  onPress,
  danger = false,
  link = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
  link?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={link ? 'link' : 'button'}
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={21}
          color={danger ? palette.error : palette.primary}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Ionicons
        name={link ? 'open-outline' : 'chevron-forward'}
        size={19}
        color={danger ? palette.error : palette.muted}
      />
    </Pressable>
  );
}

export default function Settings() {
  const { user, signOut, deleteUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: async () => {
          console.log('Sign Out Pressed');
          await signOut();
          router.replace("/(auth)/login");
        },
        style: 'destructive',
      }
    ])
  }

  const handleDelete = async () => {
    if (!user) throw new Error('User not authenticated');

    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be reversed.", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete Account',
        onPress: async () => {
          console.log('Delete pressed');
          await deleteUser();
          router.replace("/(auth)/splashscreen");
        },
        style: 'destructive',
      }
    ])
  }

  /** Opens a policy without losing the current onboarding screen. */
  const openPolicy = async (url: string) => {
    try {
      await openBrowserAsync(url);
    } catch {
      Alert.alert('Unable to open page', 'Please try again.');
    }
  }

  return (
    <AuthScreen>
      <AuthIntro
        title="Settings"
        description="Personalise your experience and control your account."
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={27} color={palette.success} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.greeting}>SIGNED IN AS</Text>
          <Text style={styles.profileName}>{user?.name || 'Profile not completed'}</Text>
          <Text style={styles.profileEmail}>
            {user?.email || 'Add an email address'}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={styles.card}>
        <SettingRow
          icon="person-outline"
          title="Edit Profile"
          description="Name, health details, and email address"
          onPress={() => router.push('/(tabs)/(settings)/profile')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="notifications-outline"
          title="Notifications"
          description="Choose when MPowered Health sends reminders"
          onPress={() => router.push('/(tabs)/(settings)/notifications')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          description="See how your information is collected and protected"
          link
          onPress={() => void openPolicy('https://muscha.org/privacy-policy/')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="document-text-outline"
          title="Terms and Conditions"
          description="Read the rules and responsibilities for using the app"
          link
          onPress={() => void openPolicy('https://muscha.org/terms-and-conditions/')}
        />
      </View>

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.card}>
        <SettingRow
          icon="lock-closed-outline"
          title="Password and Security"
          description="Change the password used to sign in"
          onPress={() => router.push('/(tabs)/(settings)/profile?edit=password')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="log-out-outline"
          title="Sign Out"
          description="End the current session on this device"
          onPress={handleSignOut}
        />
      </View>

      <Text style={styles.sectionLabel}>DANGER ZONE</Text>
      <View style={[styles.card, styles.dangerCard]}>
        <SettingRow
          icon="trash-outline"
          title="Delete Account"
          description="Permanently erase your account and saved health data"
          danger
          onPress={handleDelete}
        />
      </View>
      <Text style={styles.sponsor}>Supported by ABBVIE</Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: palette.selectionBackground,
    borderRadius: 24,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.light,
    shadowColor: palette.success,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.success,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  profileCopy: { flex: 1, marginLeft: 14 },
  greeting: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: palette.muted, marginBottom: 4 },
  profileName: { fontSize: 19, lineHeight: 24, fontWeight: '800', color: palette.text },
  profileEmail: { fontSize: 12, lineHeight: 17, color: palette.muted, marginTop: 3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.light,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.success, marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: '800', color: palette.success },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.muted,
    marginTop: 28,
    marginBottom: 9,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: palette.text,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dangerCard: { borderColor: '#F4D3D6', backgroundColor: '#FFF7F7' },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 2 },
  rowPressed: { opacity: 0.65 },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FCEAEC' },
  rowCopy: { flex: 1, marginLeft: 13, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: palette.text },
  rowDescription: { fontSize: 12, lineHeight: 17, color: palette.muted, marginTop: 3 },
  dangerText: { color: palette.error },
  divider: { height: 1, backgroundColor: palette.line, marginLeft: 55 },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 34,
  },
});
