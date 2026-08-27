import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, palette } from '@/components/mha-ui';
import { SupportTabs } from '@/components/support-tabs';
const appointment = (title: string, date: string, doctor: string, service: string) => (
  <Pressable
    onPress={() => router.push('/support-detail')}
    style={({ pressed }) => [s.card, pressed && s.pressed]}
  >
    <Text style={s.cardTitle}>{title}</Text>
    <Text style={s.line}>Appointment Date: {date}</Text>
    <Text style={s.line}>Patient’s Name: John Smith</Text>
    <Text style={s.line}>Doctor’s Name: {doctor}</Text>
    <Text style={s.line}>Health Services: {service}</Text>
    <Text style={s.view}>View →</Text>
  </Pressable>
);
export default function SupportHome() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Upcoming Appointments</Text>
        <Text style={s.copy}>
          Here are upcoming appointments that you have been nominated as a support person.
        </Text>
        <Text style={s.sort}>Sort by: time</Text>
        {appointment('Appointment #1', '24/06/2026', 'Dr Jane', 'General Practitioner (GP)')}
        {appointment('Appointment #2', '02/08/2026', 'Dr Paul Arm', 'Physiotherapist')}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/workflow',
              params: {
                flow: 'archive',
              },
            })
          }
        >
          <Text style={s.archive}>View Archived Appointments</Text>
        </Pressable>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
      <SupportTabs active="care" />
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
  copy: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.muted,
    marginTop: 8,
  },
  sort: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    textAlign: 'right',
    marginVertical: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2F174A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  pressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 10,
  },
  line: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
  },
  view: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.primary,
    textAlign: 'right',
    marginTop: 12,
  },
  archive: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.primary,
    textAlign: 'center',
    padding: 16,
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 10,
  },
});
