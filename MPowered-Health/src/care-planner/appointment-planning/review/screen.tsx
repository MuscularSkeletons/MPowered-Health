import { getPainHistory } from '@/shared/health-records/pain-history';
import { ActionButton, MhaHeader } from '@/shared/ui/mha-ui';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentSummary } from '@/care-planner/shared/AppointmentSummary';
import { AppointmentQuestionList } from '@/care-planner/shared/AppointmentQuestionList';
import { s } from '@/care-planner/shared/styles';
import { usePlanningNavigation } from '../usePlanningNavigation';
import { buildAppointmentPlan } from '../appointment-draft/draft';
import { addAppointment } from '@/care-planner/appointments/repository';
import { buildAppointmentQuestions } from '@/care-planner/appointments/question-suggestions';
import { useAppointmentDraft } from '../appointment-draft/DraftProvider';
export default function AppointmentPlanReviewScreen() {
  const { draft } = useAppointmentDraft();
  const navigation = usePlanningNavigation();
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
          <AppointmentSummary appointment={plan} />
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
