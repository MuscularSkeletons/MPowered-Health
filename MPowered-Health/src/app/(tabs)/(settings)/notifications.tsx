import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
// temporary UI reusing auth ui
import {
  AuthIntro,
  AuthScreen,
  authStyles,
} from '@/components/auth/auth-ui';
import { palette } from '@/constants/profile/ui';

// TODO: implement notifications in separate sprint if have time to do
export default function ManageNotifications() {
  const router = useRouter();
  return (
    <AuthScreen>
      <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
      <AuthIntro
        sectionLabel="NOTIFICATIONS"
        title="Notification preferences"
        description="Choose how and when you receive reminders."
      />
      <View style={styles.notice}>
        <View style={styles.noticeIcon}>
          <Text style={styles.noticeIconText}>✓</Text>
        </View>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>You are in control</Text>
          <Text style={styles.noticeText}>
            Your reminder options will appear here when this feature becomes available.
          </Text>
        </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    backgroundColor: palette.selectionBackground,
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: palette.light,
  },
  noticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeIconText: { color: palette.success, fontWeight: '800' },
  noticeCopy: { flex: 1, marginLeft: 12 },
  noticeTitle: { color: palette.text, fontSize: 14, fontWeight: '800' },
  noticeText: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
});


