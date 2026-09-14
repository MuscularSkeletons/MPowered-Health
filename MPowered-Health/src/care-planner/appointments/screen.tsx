import { getPainHistory } from '@/shared/health-records/pain-history';
import { ActionButton, MhaHeader, palette } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnswerModal } from './answers/AnswerModal';
import { AppointmentOverview } from '@/care-planner/shared/OverviewCard';
import { AppointmentQuestionList } from '@/care-planner/shared/QuestionList';
import { s } from '@/care-planner/shared/review-styles';
import { RecordingConsentModal } from './recording/ConsentModal';
import { useConsultationAnswers } from './answers/useAnswers';
import type { PlannedAppointment } from '@/care-planner/appointments/types';
import { getAppointment } from '@/care-planner/appointments/repository';
import { buildAppointmentQuestions } from '@/care-planner/shared/suggestions';
export default function AppointmentReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const appointment = getAppointment(id);
  if (!appointment)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <MhaHeader />
        <View style={{ padding: 24 }}>
          <Text>This appointment is no longer available.</Text>
          <ActionButton label="Back to Care Planner" onPress={() => router.replace('/care')} />
        </View>
      </SafeAreaView>
    );
  return <Consultation key={id} appointment={appointment} />;
}
function Consultation({ appointment }: { appointment: PlannedAppointment }) {
  const scroll = useRef<ScrollView>(null);
  const controller = useConsultationAnswers();
  const [consentOpen, setConsentOpen] = useState(false);
  const [consented, setConsented] = useState(!!appointment.signaturePaths?.length);
  const questions = appointment.questions ?? buildAppointmentQuestions(getPainHistory().at(-1));
  const closeConsent = () => {
    setConsentOpen(false);
    requestAnimationFrame(() => scroll.current?.scrollTo({ y: 0, animated: false }));
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView
        ref={scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.replace('/care')}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>Review My Appointment Plan</Text>
        <View style={s.plan}>
          <AppointmentOverview appointment={appointment} />
          <Text style={s.questionsTitle}>Questions to ask</Text>
          <Pressable onPress={() => setConsentOpen(true)} style={[s.consentRow, s.consentRowOn]}>
            <View style={s.consentCopy}>
              <Text style={[s.consentText, s.consentTextOn]}>
                {consented
                  ? 'Recording consent obtained'
                  : 'Recording consent needs to be obtained'}
              </Text>
            </View>
            <View style={[s.check, consented && s.checkOn]}>
              <Text style={s.checkMark}>{consented ? '✓' : ''}</Text>
            </View>
          </Pressable>
          <AppointmentQuestionList
            questions={questions}
            savedAnswers={controller.savedAnswers}
            onSelect={(question) => {
              controller.setAnswer(controller.savedAnswers[question] ?? '');
              controller.setActiveQuestion(question);
            }}
          />
        </View>
      </ScrollView>
      <AnswerModal controller={controller} />
      {consentOpen ? (
        <RecordingConsentModal
          open
          appointment={getAppointment(appointment.id)}
          onClose={closeConsent}
          onSaved={() => setConsented(true)}
        />
      ) : null}
    </SafeAreaView>
  );
}
