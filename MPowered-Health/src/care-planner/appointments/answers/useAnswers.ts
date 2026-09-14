// This screen lets the user review and update a planned healthcare appointment.
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useConsultationAnswers() {
  // Keep modal drafts separate from saved answers so Cancel can discard changes.
  const [activeQuestion, setActiveQuestion] = useState<string>();
  const [answer, setAnswer] = useState('');
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, string>>({});
  const [recordingStarting, setRecordingStarting] = useState(false);
  const [playbackPending, setPlaybackPending] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer();
  const playerState = useAudioPlayerStatus(player);
  useEffect(() => {
    if (!playbackPending) return;
    const play = () => {
      player.play();
      setPlaybackPending(false);
    };
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded) play();
    });
    if (player.isLoaded) play();
    return () => subscription.remove();
  }, [playbackPending, player]);
  // Ask for microphone access only when recording starts.
  const startRecording = async () => {
    setRecordingStarting(true);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Microphone access needed',
          'Enable microphone access in your phone settings to record an answer.',
        );
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert(
        'Recording unavailable',
        'Recording could not start. Please check microphone access and try again.',
      );
    } finally {
      setRecordingStarting(false);
    }
  };
  // The same button starts recording and saves it on the next press.
  const handleRecording = async () => {
    if (recordingStarting) return;
    if (recorderState.isRecording) {
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
        if (activeQuestion && recorder.uri)
          setRecordedAnswers((previous) => ({
            ...previous,
            [activeQuestion]: recorder.uri!,
          }));
        else Alert.alert('Recording not saved', 'Please try recording the answer again.');
      } catch {
        Alert.alert('Recording not saved', 'Please try recording the answer again.');
      }
      return;
    }
    await startRecording();
  };
  // Pause active playback or load the current answer before playing it.
  const playRecording = async () => {
    if (!activeQuestion || playbackPending) return;
    const uri = recordedAnswers[activeQuestion];
    if (!uri) return;
    if (playerState.playing) {
      player.pause();
      return;
    }
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      setPlaybackPending(true);
      player.replace({ uri });
    } catch {
      setPlaybackPending(false);
      Alert.alert(
        'Playback unavailable',
        'The recording could not be played. Please try recording the answer again.',
      );
    }
  };
  // Remove only this question's recording before making a replacement.
  const recordAgain = async () => {
    if (!activeQuestion) return;
    setPlaybackPending(false);
    player.pause();
    setRecordedAnswers((previous) => {
      const next = { ...previous };
      delete next[activeQuestion];
      return next;
    });
    await startRecording();
  };
  // Prefer typed text and keep a marker when the answer is voice-only.
  const saveAnswer = () => {
    if (activeQuestion && (answer.trim() || recordedAnswers[activeQuestion]))
      setSavedAnswers((v) => ({
        ...v,
        [activeQuestion]: answer.trim() || 'Voice answer recorded.',
      }));
    setAnswer('');
    setActiveQuestion(undefined);
  };
  return {
    activeQuestion,
    setActiveQuestion,
    answer,
    setAnswer,
    savedAnswers,
    recordedAnswers,
    recordingStarting,
    playbackPending,
    recorderState,
    playerState,
    handleRecording,
    playRecording,
    recordAgain,
    saveAnswer,
  };
}
