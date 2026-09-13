import { buildAppointmentQuestions } from '@/features/care-planner/shared/suggestions';
import { getPainHistory, painRecordDate } from '@/features/pain-tracker/my-pain/history';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { ActionButton } from '@/shared/ui/mha-ui';
import { Pressable, Text, View } from 'react-native';
import { AppointmentQuestions } from './QuestionPicker';
import { useAppointmentNavigation } from '../usePlanNavigation';
import { useAppointmentDraft } from '../state/DraftProvider';
export default function AppointmentQuestionsScreen() {
  const navigation = useAppointmentNavigation();
  const { draft, dispatch } = useAppointmentDraft();
  const latestPain = getPainHistory().at(-1);
  const suggestions = buildAppointmentQuestions(latestPain);
  const selected = draft.questions;
  const review = (skip = false) => {
    if (skip) dispatch({ type: 'skipQuestions' });
    navigation.review();
  };
  return (
    <Shell title="Add Questions for My Appointment" onBack={navigation.details}>
      <Text style={s.flowEyebrow}>CARE PLANNER · 2/3</Text>
      <Text style={s.copy}>
        We have provided some suggested questions to ask your healthcare professional/s.
      </Text>
      <AppointmentQuestions
        suggestions={suggestions}
        assessmentDate={latestPain ? painRecordDate(latestPain) : undefined}
        value={selected}
        pick={(value) => dispatch({ type: 'toggleQuestion', value })}
        customQuestion={draft.customQuestion}
        setCustomQuestion={(value) => dispatch({ type: 'field', field: 'customQuestion', value })}
      />
      <View style={s.footer}>
        <ActionButton label="Continue" onPress={() => review()} />
        <Pressable onPress={() => review(true)}>
          <Text style={s.skip}>Skip</Text>
        </Pressable>
      </View>
    </Shell>
  );
}
