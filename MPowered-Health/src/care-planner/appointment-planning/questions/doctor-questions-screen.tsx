import { buildAppointmentQuestions } from '@/care-planner/appointments/question-suggestions';
import { getPainHistory, painRecordDate } from '@/shared/health-records/pain-history';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { ActionButton } from '@/shared/ui/mha-ui';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { AppointmentQuestion } from '@/care-planner/appointments/types';
import { Choice } from '@/shared/forms/Choice';
import { s as questionStyles } from '../form-styles';
import { usePlanningNavigation } from '../usePlanningNavigation';
import { useAppointmentDraft } from '../appointment-draft/DraftProvider';
export default function AppointmentQuestionsScreen() {
  const navigation = usePlanningNavigation();
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
      <QuestionPicker
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

function QuestionPicker({
  suggestions,
  assessmentDate,
  value,
  pick,
  customQuestion,
  setCustomQuestion,
}: {
  suggestions: AppointmentQuestion[];
  assessmentDate?: string;
  value: string[];
  pick: (v: string) => void;
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
}) {
  // Keep the group stored with each question so personalized wording cannot change its section.
  const groups = ['Pain location', 'Pain intensity', 'Pain impact', 'Management'].map((title) => ({
    title,
    items: suggestions
      .filter((question) => question.group === title)
      .map((question) => question.text),
  }));
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={questionStyles.questionSource}>
        {assessmentDate
          ? `Based on your latest My Pain assessment from ${assessmentDate}.`
          : 'Complete My Pain to receive questions based on your latest assessment.'}
      </Text>
      {groups.map((group) => (
        <Choice
          key={group.title}
          title={group.title}
          options={group.items}
          value={value}
          pick={pick}
          multi
        />
      ))}
      <View style={questionStyles.choiceWrap}>
        <Text style={questionStyles.choiceTitle}>Other</Text>
        <TextInput
          multiline
          value={customQuestion}
          onChangeText={setCustomQuestion}
          placeholder="Type your question"
          placeholderTextColor="#81798A"
          style={[questionStyles.input, { minHeight: 92, backgroundColor: '#fff' }]}
        />
      </View>
    </View>
  );
}
