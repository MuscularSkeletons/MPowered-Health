import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, palette } from '@/components/mha-ui';
import { SupportTabs } from '@/components/support-tabs';
export default function SupportDetail() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={() => router.replace('/support-home')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>Appointment #1</Text>
        <View style={s.card}>
          <Text style={s.line}>Appointment Date: 24/06/2026</Text>
          <Text style={s.line}>Patient’s Name: John Smith</Text>
          <Text style={s.line}>Doctor’s Name: Dr Jane</Text>
          <Text style={s.line}>Doctor Health Services: General Practitioner (GP)</Text>
        </View>
        <Text style={s.heading}>Questions to ask:</Text>
        <View style={s.question}>
          <Text style={s.category}>Pain Location</Text>
          <Text style={s.questionText}>What could be causing pain in my lower back and knee?</Text>
          <Text style={s.questionText}>
            Are these areas related, or are they likely separate issues?
          </Text>
          <Pressable>
            <Text style={s.modify}>Modify Questions</Text>
          </Pressable>
        </View>
        <View style={s.question}>
          <Text style={s.category}>Pain Intensity</Text>
          <Text style={s.questionText}>
            My average pain over the past two weeks has been around 7 - what does that indicate?
          </Text>
          <Pressable>
            <Text style={s.modify}>Modify Questions</Text>
          </Pressable>
        </View>
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
  back: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  card: {
    backgroundColor: '#F7F4FC',
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
  },
  line: {
    fontSize: 13,
    lineHeight: 21,
    color: palette.text,
  },
  heading: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
    marginTop: 28,
    marginBottom: 14,
  },
  question: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
    marginBottom: 7,
  },
  modify: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.primary,
    textAlign: 'right',
    paddingTop: 8,
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 16,
  },
});
