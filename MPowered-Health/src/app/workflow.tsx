import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, palette } from '@/components/mha-ui';
import { SupportTabs } from '@/components/support-tabs';

// This branch contains only the support-person experience. These definitions
// preserve its existing appointment, invitation, archive, and account screens.
type Step = {
  title: string;
  copy: string;
  fields?: string[];
  options?: string[];
  optional?: boolean;
  action?: string;
};
const flows: Record<string, { eyebrow: string; steps: Step[] }> = {
  settings: {
    eyebrow: 'SETTING',
    steps: [
      {
        title: 'Account and privacy',
        copy: 'Manage your profile, support-person access, permissions, and health information.',
        options: [
          'Personal details',
          'Support-person access',
          'Contact permission',
          'Recording permission',
          'Privacy Policy',
          'Terms and Conditions',
        ],
      },
      {
        title: 'Your health data',
        copy: 'Review, export, or delete your stored health information.',
        options: ['Export my information', 'Delete my local data'],
        optional: true,
      },
    ],
  },
  join: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Join Appointment',
        copy: "Enter the 6-digit PIN shared by the person you're supporting to view and add questions for their upcoming visit.",
        fields: ['6-digit PIN'],
        action: 'Join',
      },
    ],
  },
  support: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Upcoming Appointments',
        copy: 'Here are upcoming appointments that you have been nominated as a support person.',
        options: [
          'Appointment #1 — 24/06/2026 — John Smith — Dr Jane — General Practitioner (GP)',
          'Appointment #2 — 02/08/2026 — John Smith — Dr Paul Arm — Physiotherapist',
        ],
      },
      {
        title: 'Appointment #1',
        copy: 'Appointment Date: 24/06/2026\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions to ask:\nPain Location\nWhat could be causing pain in my lower back and knee?\nAre these areas related, or are they likely separate issues?\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?',
        action: 'Done',
      },
    ],
  },
  'support-detail': {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Appointment #1',
        copy: 'Appointment Date: 24/06/2026\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions to ask:\n\nPain Location\nWhat could be causing pain in my lower back and knee?\nAre these areas related, or are they likely separate issues?\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?',
        action: 'Done',
      },
    ],
  },
  archive: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Archived Appointments',
        copy: 'Review appointments that you have been nominated as a support person.',
        options: [
          'Archived Appointment #1 — 24/10/2025 — Dr Jane',
          'Archived Appointment #2 — 02/08/2025 — Dr Paul Arm',
        ],
      },
      {
        title: 'Archived Appointment #1',
        copy: 'Appointment Date: 24/10/2025\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions & Answers\nPain Location\nWhat could be causing pain in my lower back and knee?\n[Doctor’s Answer]\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?\n[Doctor’s Answer]',
        action: 'Done',
      },
    ],
  },
};

export default function SupportWorkflow() {
  const { flow = 'settings', returnTo } = useLocalSearchParams<{
    flow?: string;
    returnTo?: string;
  }>();
  // Reset answers before rendering when navigation selects a different flow.
  return <SupportForm key={flow} flow={flow} returnTo={returnTo} />;
}

function SupportForm({ flow, returnTo }: { flow: string; returnTo?: string }) {
  const data = flows[flow] ?? flows.settings;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const current = data.steps[step];
  const answer = answers[step] ?? '';
  const ready = current.optional || (!current.fields && !current.options) || !!answer.trim();
  // Support workflows return to their own screens instead of the patient app.
  const destination = returnTo === '/support-setting' ? '/support-setting' : '/support-home';
  const next = () => {
    if (step < data.steps.length - 1) setStep(step + 1);
    else router.replace(destination);
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (step ? setStep(step - 1) : router.replace(destination))}
        >
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>{current.title}</Text>
        <Text style={s.eyebrow}>
          {data.eyebrow} · {step + 1}/{data.steps.length}
        </Text>
        <Text style={s.copy}>{current.copy}</Text>
        {current.fields?.map((label) => (
          <View key={label}>
            <Text style={s.label}>{label}</Text>
            <TextInput
              style={s.input}
              placeholder={label}
              value={answer}
              onChangeText={(value) => setAnswers((previous) => ({ ...previous, [step]: value }))}
            />
          </View>
        ))}
        {current.options?.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: answer === option }}
            onPress={() => setAnswers((previous) => ({ ...previous, [step]: option }))}
            style={[s.option, answer === option && s.selected]}
          >
            <Text style={s.optionText}>{option}</Text>
          </Pressable>
        ))}
        <View style={s.footer}>
          <ActionButton
            label={current.action ?? (step === data.steps.length - 1 ? 'Done' : 'Continue')}
            disabled={!ready}
            onPress={next}
          />
          {current.optional ? (
            <Pressable onPress={next}>
              <Text style={s.skip}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      <SupportTabs active={destination === '/support-setting' ? 'setting' : 'care'} />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  back: { fontSize: 14, fontWeight: '700', color: palette.primary, paddingVertical: 14 },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    color: palette.text,
    marginVertical: 8,
  },
  eyebrow: { fontSize: 11, fontWeight: '800', color: palette.primary },
  copy: { fontSize: 15, lineHeight: 23, color: palette.muted, marginVertical: 16 },
  label: { fontSize: 12, fontWeight: '700', color: palette.text, marginBottom: 7 },
  input: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 15,
    color: palette.text,
  },
  option: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
  },
  selected: { backgroundColor: '#F3EEFF', borderColor: '#BEA1F7' },
  optionText: { fontSize: 14, lineHeight: 20, color: palette.text },
  footer: { marginTop: 32 },
  skip: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
    textAlign: 'center',
    padding: 16,
  },
});
