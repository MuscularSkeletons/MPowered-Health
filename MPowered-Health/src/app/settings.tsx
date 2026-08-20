import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, PageIntro, palette } from '@/components/mha-ui';
export default function Settings() {
  return <SafeAreaView style={s.safe} edges={['top']}><MhaHeader /><ScrollView contentContainerStyle={s.content}><PageIntro title="Setting" description="Manage how you use MPowered Health." /><View style={s.role}><Text style={s.roleTitle}>I am a</Text><Pressable style={s.roleButton} onPress={() => router.replace('/support-home')}><Text style={s.roleText}>User support person  ›</Text></Pressable></View><View style={s.accountActions}><Text style={s.accountHeading}>Account</Text><Pressable accessibilityRole="button" style={({pressed})=>[s.signOut,pressed&&s.signOutPressed]} onPress={() => router.replace('/splash')}><Text style={s.signOutText}>Sign out</Text><Text style={s.signOutChevron}>›</Text></Pressable></View><Text style={s.sponsor}>Supported by ABBVIE</Text></ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:24,paddingTop:24,paddingBottom:112
  },
  role: {
    marginTop: 28,
    backgroundColor: '#F7F4FC',
    borderRadius: 20,
    padding: 18
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.muted
  },
  roleButton: {
    paddingTop: 10
  },
  roleText: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.primary
  },
  accountActions: {
    marginTop: 34
  },
  accountHeading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: palette.muted
  },
  signOut: {
    minHeight: 56,
    marginTop: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5DFF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  signOutPressed: {
    opacity: .6
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text
  },
  signOutChevron: {
    fontSize: 24,
    color: palette.muted
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 28
  }
});
