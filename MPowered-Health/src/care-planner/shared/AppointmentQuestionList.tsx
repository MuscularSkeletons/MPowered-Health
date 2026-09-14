import { s } from './styles';
// This screen lets the user review and update a planned healthcare appointment.
import { Pressable, Text, View } from 'react-native';

import type { AppointmentQuestion } from '@/care-planner/appointments/types';
export function AppointmentQuestionList({
  questions,
  savedAnswers = {},
  onSelect,
}: {
  questions: AppointmentQuestion[];
  savedAnswers?: Record<string, string>;
  onSelect?: (question: string) => void;
}) {
  return (
    <>
      {' '}
      {['Pain location', 'Pain intensity', 'Pain impact', 'Management', 'Other']
        .filter((group) => questions.some((question) => question.group === group))
        .map((group) => (
          <View key={group} style={s.group}>
            <Text style={s.groupTitle}>{group}</Text>
            {questions
              .filter((q) => q.group === group)
              .map((q) => (
                <Pressable
                  key={q.text}
                  disabled={!onSelect}
                  onPress={() => onSelect?.(q.text)}
                  style={s.question}
                >
                  <View style={s.questionCopy}>
                    {!!onSelect ? (
                      <Text style={s.answerLabel}>
                        {savedAnswers[q.text] ? 'Doctor’s answer added' : 'Add doctor’s answer'}
                      </Text>
                    ) : null}
                    <Text style={s.questionText}>{q.text}</Text>
                  </View>
                  {!!onSelect ? <Text style={s.edit}>✎</Text> : null}
                </Pressable>
              ))}
          </View>
        ))}
    </>
  );
}
