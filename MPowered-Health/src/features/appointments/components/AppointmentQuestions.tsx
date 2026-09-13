import { AppointmentQuestion } from '@/features/appointments/services/appointments';
import { s } from '@/features/appointments/styles/forms';
import { Choice } from '@/shared/forms/Choice';
import { Text, TextInput, View } from 'react-native';
export function AppointmentQuestions({
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
      <Text style={s.questionSource}>
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
      <View style={s.choiceWrap}>
        <Text style={s.choiceTitle}>Other</Text>
        <TextInput
          multiline
          value={customQuestion}
          onChangeText={setCustomQuestion}
          placeholder="Type your question"
          placeholderTextColor="#81798A"
          style={[s.input, { minHeight: 92, backgroundColor: '#fff' }]}
        />
      </View>
    </View>
  );
}
