import { getPainHistory } from '@/features/pain/services/pain-history';
import { ActionButton, MhaHeader } from '@/shared/ui/mha-ui';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentOverview } from '../components/AppointmentOverview';
import { AppointmentQuestionList } from '../components/AppointmentQuestionList';
import { s } from '../components/AppointmentReviewScreen.styles';
import { useAppointmentNavigation } from '../hooks/useAppointmentNavigation';
import { buildAppointmentPlan } from '../models/appointment-draft';
import { addAppointment } from '../services/appointments';
import { buildAppointmentQuestions } from '../services/question-suggestions';
import { useAppointmentDraft } from '../state/AppointmentDraftProvider';
export default function AppointmentPlanReviewScreen() {
  const { draft } = useAppointmentDraft();
  const navigation = useAppointmentNavigation();
  const plan = buildAppointmentPlan(draft, buildAppointmentQuestions(getPainHistory().at(-1)));
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={navigation.questions}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>Review My Appointment Plan</Text>
        <Text style={s.step}>CARE PLANNER · 3/3</Text>
        <View style={s.plan}>
          <AppointmentOverview appointment={plan} />
          <Text style={s.questionsTitle}>Questions to ask</Text>
          {!plan.questions.length ? (
            <View style={s.noQuestions}>
              <Text style={s.noQuestionsText}>No questions selected.</Text>
            </View>
          ) : null}
          <AppointmentQuestionList questions={plan.questions} />
        </View>
        <View style={s.planFooter}>
          <ActionButton
            label="Save plan"
            onPress={() => {
              addAppointment(plan);
              navigation.leave();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
