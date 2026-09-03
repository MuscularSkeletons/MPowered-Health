import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, SummaryRow, palette } from '@/components/mha-ui';
import { SupportTabs } from '@/components/support-tabs';
export default function SupportSetting() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Setting</Text>
        <View style={s.list}>
          <SummaryRow
            tone="violet"
            symbol="#"
            title="Join Appointment"
            description="Enter the 6-digit PIN shared by the person you're supporting."
            meta="Open"
            onPress={() =>
              router.push({
                pathname: '/workflow',
                params: {
                  flow: 'join',
                  returnTo: '/support-setting',
                },
              })
            }
          />
          <SummaryRow
            tone="gold"
            symbol="↺"
            title="Archived Appointments"
            description="Review previous appointment questions and answers."
            meta="Open"
            onPress={() =>
              router.push({
                pathname: '/workflow',
                params: {
                  flow: 'archive',
                  returnTo: '/support-setting',
                },
              })
            }
          />
          <SummaryRow
            tone="mint"
            symbol="⚙"
            title="Account and privacy"
            description="Personal details, permissions and privacy."
            meta="Open"
            onPress={() =>
              router.push({
                pathname: '/workflow',
                params: {
                  flow: 'settings',
                  returnTo: '/support-setting',
                },
              })
            }
          />
        </View>
      </ScrollView>
      <SupportTabs active="setting" />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: palette.text,
    marginTop: 16,
  },
  list: {
    gap: 14,
    marginTop: 24,
  },
});
