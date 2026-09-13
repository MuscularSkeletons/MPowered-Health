import { s } from '../components/AppointmentReviewScreen.styles';
// This screen lets the user review and update a planned healthcare appointment.
import { palette } from '@/shared/ui/mha-ui';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useConsultationAnswers } from '../hooks/useConsultationAnswers';
export function VoiceRecordingControls({
  controller,
}: {
  controller: ReturnType<typeof useConsultationAnswers>;
}) {
  const {
    activeQuestion,
    recordedAnswers,
    recordingStarting,
    playbackPending,
    recorderState,
    playerState,
    handleRecording,
    playRecording,
    recordAgain,
  } = controller;
  return (
    <>
      {' '}
      {activeQuestion && recordedAnswers[activeQuestion] && !recorderState.isRecording ? (
        <View
          style={[
            s.recordStatusSaved,
            { padding: 14, marginTop: 14, justifyContent: 'flex-start' },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: '#D8C7FA',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '900',
                  color: '#5E17EB',
                }}
              >
                ✓
              </Text>
            </View>
            <Text style={[s.recordSavedText, { fontSize: 13 }]}>Voice recording saved</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable
              disabled={playbackPending}
              onPress={playRecording}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 13,
                backgroundColor: palette.primary,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
                opacity: playbackPending ? 0.72 : 1,
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>
                {playbackPending
                  ? 'Loading…'
                  : playerState.playing
                    ? 'Ⅱ  Pause'
                    : '▶  Play recording'}
              </Text>
            </Pressable>
            <Pressable
              onPress={recordAgain}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 13,
                borderWidth: 1.5,
                borderColor: palette.accent,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: palette.primaryDark,
                }}
              >
                Record again
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              selected: recorderState.isRecording,
              disabled: recordingStarting,
            }}
            disabled={recordingStarting}
            onPress={handleRecording}
            style={({ pressed }) => [
              s.recordChoice,
              recorderState.isRecording && {
                backgroundColor: '#F3EEFF',
                borderColor: '#8C52FF',
                shadowColor: '#5E17EB',
                shadowOpacity: 0.12,
              },
              pressed && s.recordChoicePressed,
            ]}
          >
            <View
              style={[
                s.mic,
                recorderState.isRecording && {
                  backgroundColor: '#5E17EB',
                },
              ]}
            >
              {recorderState.isRecording ? (
                <Text style={s.stopIcon}>■</Text>
              ) : (
                <Image
                  source={require('@/assets/icons/iconify-microphone.svg')}
                  style={s.micImage}
                  contentFit="contain"
                />
              )}
            </View>
            <Text style={[s.recordText, recorderState.isRecording && { color: '#5E17EB' }]}>
              {recorderState.isRecording
                ? 'Stop voice recording'
                : recordingStarting
                  ? 'Starting recording…'
                  : 'Record answer instead of typing'}
            </Text>
          </Pressable>
          {recorderState.isRecording ? (
            <View
              style={[
                s.recordStatus,
                {
                  backgroundColor: '#F3EEFF',
                  borderWidth: 1,
                  borderColor: '#D8C7FA',
                },
              ]}
            >
              <View style={[s.liveDot, { backgroundColor: '#8C52FF' }]} />
              <Text style={[s.recordStatusText, { color: '#5E17EB' }]}>Recording in progress…</Text>
            </View>
          ) : null}
        </>
      )}
    </>
  );
}
