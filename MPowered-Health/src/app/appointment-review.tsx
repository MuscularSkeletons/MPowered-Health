import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { ActionButton, MhaHeader, palette } from '@/components/mha-ui';
import { addAppointment, getAppointment, saveAppointmentSignature } from '@/constants/appointments';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';

const questions = [
  {
    group: 'Pain location',
    text: 'What could be causing pain in my lower back, neck, and knee?',
  },
  {
    group: 'Pain location',
    text: 'Are these areas related, or are they likely separate issues?',
  },
  {
    group: 'Pain intensity',
    text: 'My average pain over the past two weeks has been around 7 — what does this indicate?',
  },
  {
    group: 'Pain intensity',
    text: 'What can I do to better manage days when the pain is high?',
  },
];

function SignaturePad({
  paths,
  setPaths,
}: {
  paths: string[];
  setPaths: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const activePath = useRef(-1);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { x, y } =
            event.nativeEvent.locationX === undefined
              ? { x: 0, y: 0 }
              : {
                  x: event.nativeEvent.locationX,
                  y: event.nativeEvent.locationY,
                };
          setPaths((previous) => {
            activePath.current = previous.length;
            return [...previous, `M ${x} ${y}`];
          });
        },
        onPanResponderMove: (event) => {
          const x = event.nativeEvent.locationX,
            y = event.nativeEvent.locationY;
          setPaths((previous) =>
            previous.map((path, index) =>
              index === activePath.current ? `${path} L ${x} ${y}` : path,
            ),
          );
        },
      }),
    [setPaths],
  );
  const clear = () => setPaths([]);
  return (
    <View>
      <View style={s.signaturePad} {...responder.panHandlers}>
        <Svg width="100%" height="120" pointerEvents="none">
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={palette.text}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {!paths.length ? <Text style={s.signatureHint}>Draw signature here</Text> : null}
      </View>
      <Pressable onPress={clear} style={s.clearSignature}>
        <Text style={s.clearSignatureText}>Clear signature</Text>
      </Pressable>
    </View>
  );
}

export default function AppointmentReview() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  // A deleted account has no appointments; stale links should show an empty state.
  if (mode !== 'plan' && !getAppointment(id))
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <MhaHeader />
        <View style={{ padding: 24 }}>
          <Text>This appointment is no longer available.</Text>
          <ActionButton label="Back to Care Planner" onPress={() => router.replace('/care')} />
        </View>
      </SafeAreaView>
    );
  return <AppointmentReviewContent />;
}

function AppointmentReviewContent() {
  const insets = useSafeAreaInsets();
  const reviewScrollRef = useRef<ScrollView>(null);
  const {
    id,
    mode,
    doctor,
    date,
    service,
    customQuestion,
    questions: questionParam,
    questionData,
  } = useLocalSearchParams<{
    id?: string;
    mode?: string;
    doctor?: string;
    date?: string;
    service?: string;
    customQuestion?: string;
    questions?: string;
    questionData?: string;
  }>();
  const planning = mode === 'plan';
  const appointment = planning
    ? {
        id: 'draft',
        doctor: doctor || 'Healthcare practitioner',
        date: date || 'Date not specified',
        service: service || 'Not added',
      }
    : getAppointment(id);
  const selectedQuestions = questionParam ? (JSON.parse(questionParam) as string[]) : [];
  const routedQuestions = questionData
    ? (JSON.parse(questionData) as { group: string; text: string }[])
    : selectedQuestions.map((text, index) => ({
        group: index < 2 ? 'Pain location' : 'Pain intensity',
        text,
      }));
  const displayedQuestions = planning
    ? [...routedQuestions, ...(customQuestion ? [{ group: 'Other', text: customQuestion }] : [])]
    : (appointment.questions ?? questions);
  const [activeQuestion, setActiveQuestion] = useState<string>();
  const [answer, setAnswer] = useState('');
  const [consentOpen, setConsentOpen] = useState(false);
  const [signaturePaths, setSignaturePaths] = useState<string[]>(appointment.signaturePaths ?? []);
  const [consented, setConsented] = useState(Boolean(appointment.signaturePaths?.length));
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, string>>({});
  const [recordingStarting, setRecordingStarting] = useState(false);
  const [playbackPending, setPlaybackPending] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer();
  const playerState = useAudioPlayerStatus(player);
  useEffect(() => {
    if (playbackPending && playerState.isLoaded) {
      player.play();
      setPlaybackPending(false);
    }
  }, [playbackPending, playerState.isLoaded, player]);
  useEffect(() => {
    const savedAppointment = getAppointment(id);
    setSignaturePaths(savedAppointment?.signaturePaths ?? []);
    setConsented(Boolean(savedAppointment?.signaturePaths?.length));
    setActiveQuestion(undefined);
    setConsentOpen(false);
    setSavedAnswers({});
    setRecordedAnswers({});
    setAnswer('');
  }, [id]);
  const openConsent = () => {
    const saved = getAppointment(appointment.id)?.signaturePaths ?? signaturePaths;
    setSignaturePaths([...saved]);
    setConsentOpen(true);
  };
  const closeConsent = () => {
    setConsentOpen(false);
    requestAnimationFrame(() => reviewScrollRef.current?.scrollTo({ y: 0, animated: false }));
  };
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
  const saveConsent = async () => {
    if (!signaturePaths.length) return;
    saveAppointmentSignature(appointment.id, signaturePaths);
    setConsented(true);
    closeConsent();
  };
  const saveAnswer = () => {
    if (activeQuestion && (answer.trim() || recordedAnswers[activeQuestion]))
      setSavedAnswers((v) => ({
        ...v,
        [activeQuestion]: answer.trim() || 'Voice answer recorded.',
      }));
    setAnswer('');
    setActiveQuestion(undefined);
  };
  const backFromReview = () =>
    planning
      ? router.replace({
          pathname: '/workflow',
          params: {
            flow: 'appointment',
            step: '1',
            resume: '1',
            doctor: appointment.doctor,
            date: appointment.date,
            service: appointment.service,
            customQuestion: customQuestion || '',
            questions: JSON.stringify(selectedQuestions),
          },
        })
      : router.replace('/care');
  const savePlan = () => {
    addAppointment({
      doctor: appointment.doctor,
      date: appointment.date,
      service: appointment.service,
      questions: displayedQuestions,
    });
    router.replace('/care');
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView
        ref={reviewScrollRef}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={backFromReview}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>Review My Appointment Plan</Text>
        {planning ? <Text style={s.step}>CARE PLANNER · 3/3</Text> : null}
        <View style={s.plan}>
          <Text style={s.cardTitle}>Appointment overview</Text>
          <View style={s.overview}>
            <Text style={s.metaLabel}>Appointment date</Text>
            <Text style={s.metaValue}>{appointment.date}</Text>
            <Text style={s.metaLabel}>Doctor’s name</Text>
            <Text style={s.metaValue}>{appointment.doctor}</Text>
            <Text style={s.metaLabel}>Health services</Text>
            <Text style={s.metaValue}>{appointment.service}</Text>
          </View>
          <Text style={s.questionsTitle}>Questions to ask</Text>
          {planning && !displayedQuestions.length ? (
            <View style={s.noQuestions}>
              <Text style={s.noQuestionsText}>No questions selected.</Text>
            </View>
          ) : null}
          {!planning ? (
            <Pressable onPress={openConsent} style={[s.consentRow, s.consentRowOn]}>
              <View style={s.consentCopy}>
                <Text style={[s.consentText, s.consentTextOn]}>
                  {consented
                    ? 'Recording consent obtained'
                    : 'Recording consent needs to be obtained'}
                </Text>
              </View>
              <View style={[s.check, consented && s.checkOn]}>
                <Text style={s.checkMark}>{consented ? '✓' : ''}</Text>
              </View>
            </Pressable>
          ) : null}
          {['Pain location', 'Pain intensity', 'Pain impact', 'Management', 'Other']
            .filter((group) => displayedQuestions.some((question) => question.group === group))
            .map((group) => (
              <View key={group} style={s.group}>
                <Text style={s.groupTitle}>{group}</Text>
                {displayedQuestions
                  .filter((q) => q.group === group)
                  .map((q) => (
                    <Pressable
                      key={q.text}
                      disabled={planning}
                      onPress={() => {
                        setAnswer(savedAnswers[q.text] ?? '');
                        setActiveQuestion(q.text);
                      }}
                      style={s.question}
                    >
                      <View style={s.questionCopy}>
                        {!planning ? (
                          <Text style={s.answerLabel}>
                            {savedAnswers[q.text] ? 'Doctor’s answer added' : 'Add doctor’s answer'}
                          </Text>
                        ) : null}
                        <Text style={s.questionText}>{q.text}</Text>
                      </View>
                      {!planning ? <Text style={s.edit}>✎</Text> : null}
                    </Pressable>
                  ))}
              </View>
            ))}
        </View>
        {planning ? (
          <View style={s.planFooter}>
            <ActionButton label="Save plan" onPress={savePlan} />
          </View>
        ) : null}
      </ScrollView>
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
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}
                    >
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
                        source={require('../../assets/icons/iconify-microphone.svg')}
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
                    <Text style={[s.recordStatusText, { color: '#5E17EB' }]}>
                      Recording in progress…
                    </Text>
                  </View>
                ) : null}
              </>
            )}
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
      <Modal visible={consentOpen} animationType="slide" onRequestClose={closeConsent}>
        <SafeAreaView style={s.consentScreen} edges={['top', 'bottom']}>
          <Pressable
            onPress={closeConsent}
            style={[s.consentBack, { paddingTop: Math.max(insets.top, 20) }]}
          >
            <Text style={s.back}>‹ Back</Text>
          </Pressable>
          <View style={s.consentContent}>
            <View style={s.consentHeading}>
              <Text style={s.consentEyebrow}>CARE PLANNER</Text>
              <Text style={s.consentTitle}>Ask for Recording Consent</Text>
            </View>
            <View style={s.consentCard}>
              <Text style={s.fieldLabel}>Appointment date</Text>
              <View style={s.readonly}>
                <Text>{appointment.date}</Text>
              </View>
              <Text style={s.fieldLabel}>Doctor’s name</Text>
              <View style={s.readonly}>
                <Text>{appointment.doctor}</Text>
              </View>
              <Text style={s.fieldLabel}>Health services</Text>
              <View style={s.readonly}>
                <Text>{appointment.service}</Text>
              </View>
              <Text style={s.fieldLabel}>Doctor’s signature</Text>
              <SignaturePad paths={signaturePaths} setPaths={setSignaturePaths} />
              <Text style={s.legal}>
                By providing this signature, the healthcare practitioner agrees that the patient may
                record today’s consultation.
              </Text>
            </View>
          </View>
          <View style={s.consentFooter}>
            <ActionButton
              label="Save consent"
              disabled={!signaturePaths.length}
              onPress={saveConsent}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  detailRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3D9F6',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#D8C7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailMarkText: {
    fontSize: 10,
    fontWeight: '900',
    color: palette.primaryDark,
  },
  detailCopy: { flex: 1 },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  answerPill: {
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#D8C7FA',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerPillSaved: { backgroundColor: '#E9DEFF' },
  answerLabelSaved: { color: palette.primaryDark },
  editCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DED5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noQuestions: {
    minHeight: 54,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  noQuestionsText: { fontSize: 13, fontWeight: '600', color: palette.muted },
  answerModalScroll: {
    maxHeight: '82%',
    borderRadius: 22,
    backgroundColor: '#fff',
  },
  answerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: palette.primary,
    marginBottom: 8,
  },
  recordChoiceOn: { backgroundColor: '#FCECEF', borderColor: '#E9B7C2' },
  recordChoicePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  micImage: { width: 22, height: 22, tintColor: palette.primary },
  stopIcon: { fontSize: 15, lineHeight: 18, fontWeight: '900', color: '#fff' },
  recordTextOn: { color: palette.error },
  micOn: { backgroundColor: palette.error },
  recordStatus: {
    minHeight: 38,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#FCECEF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.error,
  },
  recordStatusText: { fontSize: 12, fontWeight: '700', color: palette.error },
  recordStatusSaved: {
    minHeight: 38,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#EDE5FF',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  recordSavedText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.primaryDark,
  },
  modalSecondary: {
    minHeight: 48,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSave: { flex: 1 },
  consentScreen: { flex: 1, backgroundColor: palette.background },
  consentBack: {
    minHeight: 64,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  consentContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  consentHeading: { marginBottom: 12 },
  consentEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: palette.primary,
    marginBottom: 6,
  },
  consentTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.35,
    color: palette.text,
  },
  consentCard: {
    flexShrink: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 10,
  },
  consentFooter: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  signaturePad: {
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DED5EA',
    backgroundColor: '#F3EEFF',
    overflow: 'hidden',
    position: 'relative',
  },
  signatureHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 38,
    textAlign: 'center',
    fontSize: 13,
    color: palette.muted,
  },
  clearSignature: {
    alignSelf: 'flex-end',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  clearSignatureText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
  },
  step: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: palette.primary,
    marginTop: 8,
  },
  planFooter: { marginTop: 22 },
  safe: { flex: 1, backgroundColor: palette.background },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 120,
  },
  back: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 12,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.45,
    color: palette.text,
  },
  plan: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5DFF0',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#32165C',
    shadowOpacity: 0.055,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: palette.text,
  },
  overview: {
    backgroundColor: '#F7F4FC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E0F3',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    marginTop: 14,
  },
  metaLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    color: palette.primaryDark,
    marginTop: 12,
  },
  metaValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.text,
    marginTop: 2,
  },
  questionsTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    color: palette.text,
    marginTop: 26,
  },
  consentRow: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#F3EEFF',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  consentRowOn: {
    backgroundColor: '#EDE5FF',
    borderColor: palette.accent,
    shadowColor: palette.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  consentCopy: { flex: 1, paddingRight: 10 },
  consentText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: palette.text,
  },
  consentTextOn: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.primaryDark,
  },
  consentMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: palette.muted,
    marginTop: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  checkMark: { fontSize: 13, fontWeight: '800', color: '#fff' },
  group: { marginTop: 22, gap: 10 },
  groupTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: palette.primaryDark,
    paddingHorizontal: 2,
  },
  question: {
    minHeight: 104,
    borderRadius: 16,
    backgroundColor: '#F7F4FC',
    borderWidth: 1,
    borderColor: '#E8E0F3',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#32165C',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  questionCopy: { flex: 1 },
  answerLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: palette.primary,
    marginBottom: 7,
  },
  questionText: { fontSize: 14, lineHeight: 21, color: palette.text },
  edit: { fontSize: 19, color: palette.primaryDark, marginLeft: 10 },
  modalShade: {
    flex: 1,
    backgroundColor: 'rgba(32,26,43,.35)',
    justifyContent: 'center',
    padding: 18,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    paddingBottom: 18,
  },
  modalQuestion: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 14,
  },
  answerInput: {
    minHeight: 220,
    maxHeight: 320,
    borderRadius: 14,
    backgroundColor: '#F4F2F7',
    padding: 14,
    fontSize: 14,
    color: palette.text,
    textAlignVertical: 'top',
  },
  recordChoice: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DED5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#32165C',
    shadowOpacity: 0.035,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  mic: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#D8C7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micText: { fontSize: 16, color: '#fff' },
  recordText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: palette.primaryDark,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  cancel: { fontSize: 14, fontWeight: '700', color: palette.muted },
  ok: { fontSize: 14, fontWeight: '800', color: palette.primary },
  consentModal: { backgroundColor: '#fff', borderRadius: 22, padding: 20 },
  fieldLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: palette.text,
    marginTop: 8,
    marginBottom: 4,
  },
  readonly: {
    minHeight: 39,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DED5EA',
    backgroundColor: '#FAF9FC',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  signature: {
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#F4F2F7',
    padding: 13,
    textAlignVertical: 'top',
  },
  legal: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  consentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 18,
  },
  save: { width: 160 },
});
