import { s } from '../components/AppointmentReviewScreen.styles';
import { VoiceRecordingControls } from './VoiceRecordingControls';
// This screen lets the user review and update a planned healthcare appointment.
import { ActionButton, palette } from '@/shared/ui/mha-ui';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useConsultationAnswers } from '../hooks/useConsultationAnswers';
export function AnswerModal({
  controller,
}: {
  controller: ReturnType<typeof useConsultationAnswers>;
}) {
  const { activeQuestion, setActiveQuestion, answer, setAnswer, recordedAnswers, saveAnswer } =
    controller;
  return (
    <Modal
      visible={!!activeQuestion}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveQuestion(undefined)}
    >
      <View style={s.modalShade}>
        <ScrollView
          style={[s.answerModalScroll, { maxHeight: '76%', flexGrow: 0 }]}
          contentContainerStyle={[s.modal, { paddingBottom: 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.answerEyebrow}>ADD DOCTOR’S ANSWER</Text>
          <Text style={s.modalQuestion}>{activeQuestion}</Text>
          <TextInput
            multiline
            scrollEnabled
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter the healthcare practitioner’s answer"
            placeholderTextColor={palette.muted}
            style={[s.answerInput, { minHeight: 144, maxHeight: 210 }]}
          />
          <VoiceRecordingControls controller={controller} />
          <View style={[s.modalActions, { marginTop: 16 }]}>
            <Pressable onPress={() => setActiveQuestion(undefined)} style={s.modalSecondary}>
              <Text style={s.cancel}>Cancel</Text>
            </Pressable>
            <View style={s.modalSave}>
              <ActionButton
                label="Save answer"
                disabled={!answer.trim() && !(activeQuestion && recordedAnswers[activeQuestion])}
                onPress={saveAnswer}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
