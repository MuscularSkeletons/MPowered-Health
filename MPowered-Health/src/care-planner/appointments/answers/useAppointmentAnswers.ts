// Keeps appointment answer drafts and recording state together.
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

/** Manages typed answers, audio recordings, and playback for the current appointment. */
export function useAppointmentAnswers() {
  // Keep modal drafts separate from saved answers so Cancel can discard changes.
  const [activeQuestion, setActiveQuestion] = useState<string>();
  const [answer, setAnswer] = useState('');
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  // These audio URIs belong to this mounted screen and are not persisted as appointment records.
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, string>>({});
  const [recordingStarting, setRecordingStarting] = useState(false);
  const [playbackPending, setPlaybackPending] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer();
  const playerState = useAudioPlayerStatus(player);
  // Replacing an audio source loads asynchronously. Listen for readiness before playing it.
  useEffect(() => {
    if (!playbackPending) return;

    /** Starts playback once the audio has loaded. */
    const play = () => {
      player.play();
      setPlaybackPending(false);
    };

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded) play();
    });
    if (player.isLoaded) play();
    // Remove the listener so an old source cannot trigger playback after the effect ends.
    return () => subscription.remove();
  }, [playbackPending, player]);

  /** Requests microphone access and starts recording when permission is granted. */
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

  /**
   * Starts recording or stops and keeps the current recording.
   *
   * The same button starts recording and saves it on the next press.
   */
  const handleRecording = async () => {
    // Ignore another tap while permission and recorder setup are still pending.
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

  /**
   * Pauses playback or loads and plays the current question’s recording.
   *
   * Pause active playback or load the current answer before playing it.
   */
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

  /** Removes the current question’s recording before starting a replacement. */
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

  /** Keeps the typed answer or voice-answer marker and closes the editor. */
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
