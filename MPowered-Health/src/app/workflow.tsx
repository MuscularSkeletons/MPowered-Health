import { createElement, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, palette } from '@/components/mha-ui';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { addAppointment } from '@/constants/appointments';
import { validAnswer, workflowStep } from '@/utils/workflow-validation';
import { getReflection, reflectionWeek, saveReflection } from '@/constants/reflections';
type Step = {
  title: string;
  copy: string;
  fields?: string[];
  options?: string[];
  optionsOptional?: boolean;
  optionsBeforeFields?: boolean;
  multi?: boolean;
  optional?: boolean;
  action?: string;
};
const flows: Record<
  string,
  {
    eyebrow: string;
    steps: Step[];
  }
> = {
  onboarding: {
    eyebrow: '',
    steps: [
      {
        title: 'Your phone number',
        copy: 'We will send the four digit verification codes to this number',
        fields: ['Your phone number'],
      },
      {
        title: 'We’re sending the verification code to this number',
        copy: 'You can resend the codes in two minutes',
        fields: ['Verification code'],
      },
      {
        title: 'Hello 👋🏻',
        copy: 'A few quick questions so we can make things more relevant for you\n\nBy continuing you agree to Mpowered’s Terms and Conditions and Privacy Policy',
        action: 'Continue',
      },
      {
        title: 'Your name',
        copy: 'Your health and wellbeing is uniquely YOU!\n\nBy having your name, we will know how to address you :)',
        fields: ['Type your name'],
      },
      {
        title: 'I am a',
        copy: 'Select how you will use Mpowered.',
        options: ['User', 'Support person'],
      },
      {
        title: 'Your sex',
        copy: 'Research shows that people may experience pain differently depending on their sex.',
        options: ['Female', 'Male', 'Intersex', 'Prefer not to say'],
      },
      {
        title: 'Your year of birth',
        copy: 'Research shows that people can feel pain differently depending on their age.',
        fields: ['Year of birth'],
        optional: true,
      },
      {
        title:
          'Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?',
        copy: 'No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you :)',
        options: ['Yes, I have', 'No, I haven’t'],
      },
      {
        title: 'Tell us about the musculoskeletal or chronic pain you’re experiencing',
        copy: 'You can select multiple conditions',
        options: [
          'Arthritis',
          'Ankylosing spondylitis',
          'Back pain',
          'Baker’s cyst',
          'Bursitis',
          'Foot related conditions',
          'Fibromyalgia',
          'Gout',
          'Juvenile idiopathic arthritis and conditions',
          'Lupus',
          'Neck pain',
          'Osteoarthritis',
          'Osteoporosis',
          'Paget’s disease',
          'Perthes’ disease',
          'Polymyalgia rheumatica',
          'Psoriatic arthritis',
          'Raynaud’s phenomenon',
          'Reactive arthritis',
          'Rheumatoid arthritis',
          'Scleroderma',
          'Shoulder pain',
          'Sjogren’s disease',
        ],
        multi: true,
        optional: true,
      },
      {
        title: 'Do you have any other conditions?',
        copy: 'Type conditions or symptoms that you know',
        fields: ['Other conditions'],
        optional: true,
      },
      {
        title: 'Thank you, Jane 😃',
        copy: 'Finally, let’s link this information to your account so the next time you open this app, you can just log in',
        action: 'Continue',
      },
    ],
  },
  login: {
    eyebrow: 'SIGN IN',
    steps: [
      {
        title: 'Welcome back!',
        copy: 'Glad to see you again!',
        fields: ['Enter PIN'],
      },
      {
        title: 'Please verify this device',
        copy: 'You are logging in to a new device or different account.\n\nWe will send the four digit verification codes to this number',
        fields: ['Your phone number'],
      },
      {
        title: 'We’re sending the verification code to this number',
        copy: 'You can resend the codes in two minutes',
        fields: ['Verification code'],
      },
    ],
  },
  reflection: {
    eyebrow: 'REFLECTION',
    steps: [
      {
        title: 'My Reflection This week',
        copy: 'Write down any reflections on your pain experience and management this week. Period: 18–24 May',
        fields: ['Notes'],
        optional: true,
      },
    ],
  },
  profile: {
    eyebrow: 'MY HEALTH',
    steps: [
      {
        title: 'My MPowered Health Profile',
        copy: 'This pain profile is generated each time you complete the impact questions :)',
        action: 'View profile',
      },
      {
        title: 'Your information',
        copy: 'Jane · Female · Age group 55–64\n\nConditions\nOsteoarthritis; lower back pain\n\nMy Pain\nSeverity, pattern and location\n\nImpacts to Movement\nAverage activity hour: approximately 6 hours\n\nImpacts to Personal Care\nDaily activities and sleep have been affected\n\nImpacts to Social Health\nPain limits some social activities\n\nMy Current Management\nExercise and Vitamin D3 daily',
        action: 'Share or print PDF',
      },
    ],
  },
  records: {
    eyebrow: 'MY HEALTH',
    steps: [
      {
        title: 'My health tracking records',
        copy: 'Review your pain trend by location and switch between average, worst, and mildest pain.',
        options: ['Average pain', 'Worst pain', 'Mildest pain'],
      },
      {
        title: 'Pain history',
        copy: '18–24 May 2026\nMy Pain · My Movement · My Personal Care · My Social Health · My Management\n\n11–17 May 2026\nMy Pain · My Movement · My Personal Care',
        options: ['Load 5 more records'],
        optional: true,
      },
    ],
  },
  tips: {
    eyebrow: 'PAIN GUIDE',
    steps: [
      {
        title: 'Explore self-management tips',
        copy: 'Choose an area to open trusted information from Musculoskeletal Health Australia.',
        options: [
          'Understanding pain',
          'Exercise and movement',
          'Living well with a musculoskeletal condition',
          'Relaxation and emotions',
        ],
      },
    ],
  },
  settings: {
    eyebrow: 'SETTING',
    steps: [
      {
        title: 'Account and privacy',
        copy: 'Manage your profile, support-person access, permissions, and health information.',
        options: [
          'Personal details',
          'Support-person access',
          'Contact permission',
          'Recording permission',
          'Privacy Policy',
          'Terms and Conditions',
        ],
      },
      {
        title: 'Your health data',
        copy: 'Review, export, or delete your stored health information.',
        options: ['Export my information', 'Delete my local data'],
        optional: true,
      },
    ],
  },
  join: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Join Appointment',
        copy: "Enter the 6-digit PIN shared by the person you're supporting to view and add questions for their upcoming visit.",
        fields: ['6-digit PIN'],
        action: 'Join',
      },
    ],
  },
  support: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Upcoming Appointments',
        copy: 'Here are upcoming appointments that you have been nominated as a support person.',
        options: [
          'Appointment #1 — 24/06/2026 — John Smith — Dr Jane — General Practitioner (GP)',
          'Appointment #2 — 02/08/2026 — John Smith — Dr Paul Arm — Physiotherapist',
        ],
      },
      {
        title: 'Appointment #1',
        copy: 'Appointment Date: 24/06/2026\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions to ask:\nPain Location\nWhat could be causing pain in my lower back and knee?\nAre these areas related, or are they likely separate issues?\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?',
        action: 'Done',
      },
    ],
  },
  'support-detail': {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Appointment #1',
        copy: 'Appointment Date: 24/06/2026\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions to ask:\n\nPain Location\nWhat could be causing pain in my lower back and knee?\nAre these areas related, or are they likely separate issues?\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?',
        action: 'Done',
      },
    ],
  },
  archive: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Archived Appointments',
        copy: 'Review appointments that you have been nominated as a support person.',
        options: [
          'Archived Appointment #1 — 24/10/2025 — Dr Jane',
          'Archived Appointment #2 — 02/08/2025 — Dr Paul Arm',
        ],
      },
      {
        title: 'Archived Appointment #1',
        copy: 'Appointment Date: 24/10/2025\nPatient’s Name: John Smith\nDoctor’s Name: Dr Jane\nDoctor Health Services: General Practitioner (GP)\n\nQuestions & Answers\nPain Location\nWhat could be causing pain in my lower back and knee?\n[Doctor’s Answer]\n\nPain Intensity\nMy average pain over the past two weeks has been around 7 - what does that indicate?\n[Doctor’s Answer]',
        action: 'Done',
      },
    ],
  },
  appointment: {
    eyebrow: 'CARE PLANNER',
    steps: [
      {
        title: 'Plan My Appointment',
        copy: 'This helps you prepare; it does not create a real appointment with your healthcare provider.',
        fields: ['Appointment date', 'Doctor’s name'],
        optionsOptional: true,
        options: [
          'General Practitioner',
          'Physiotherapist',
          'Rheumatologist',
          'Osteopath',
          'Pain Medicine Specialist',
          'Orthopaedic surgeon',
          'Occupational Therapist',
        ],
      },
      {
        title: 'Add a Support Person',
        copy: 'You can nominate someone to help you prepare for your appointment or you can skip below. Maximum two support people.',
        fields: ['Support person name', 'Phone number', 'Email'],
        options: ['Add questions', 'Add doctor’s answer'],
        optionsBeforeFields: true,
        multi: true,
        optional: true,
      },
      {
        title: 'Add Questions for My Appointment',
        copy: 'We have provided some suggested questions to ask your healthcare professional/s.',
        options: [
          'What could be causing pain in my lower back, neck, and knee?',
          'Are these areas related, or are they likely separate issues?',
          'My average pain over the past two weeks has been around 7 — what does this indicate?',
          'Even though I don’t have pain right now, I’ve had severe pain at times (up to 9). What could explain these flare-ups?',
          'Is it normal for pain to vary between mild (2) and very severe (9)?',
          'What can I do to better manage days when the pain is high?',
          'What treatments or therapies could help improve my mobility?',
          'Would physiotherapy or a specific exercise program be appropriate for me?',
          'Are there movements or activities I should avoid right now?',
          'My pain is making it hard to take care of myself independently — what can we do to improve this?',
          'Are there strategies, aids, or supports that could help with daily tasks?',
          'Should we adjust my treatment plan given how much this is affecting my independence?',
          'Is this level of impact typical for my condition?',
          'What options are available to improve my quality of life?',
          'Are there additional investigations or referrals that might help?',
          'How can I prevent the pain from becoming severe again?',
          'What are realistic goals for improving my function and independence?',
        ],
        multi: true,
        optional: true,
      },
      {
        title: 'Review My Appointment Plan',
        copy: 'Date: 10 June 2026\nHealth services: General Practitioner (GP)\nDoctor: Dr. Maximiliano Prinzi\nSupport Person: Bron\n\nQuestions to ask\nPain location · Pain intensity · Management',
        action: 'Save plan',
      },
    ],
  },
};
const meds = [
  'Perindopril arginine 5 mg — Once daily',
  'Candesartan 16 mg — Once daily',
  'Amlodipine 5 mg — Once daily',
  'Vitamin D3 1000 IU — Once daily',
  'Raloxifene 60 mg — Once daily',
];
function Prescriptions() {
  const [list, setList] = useState(meds),
    [adding, setAdding] = useState(false),
    [name, setName] = useState(''),
    [strength, setStrength] = useState(''),
    [unit, setUnit] = useState('mg'),
    [form, setForm] = useState('Tablet'),
    [repeat, setRepeat] = useState('day');
  const validName = validAnswer('Medication name', name);
  const validStrength = validAnswer('Strength', strength);
  const ready = validName && validStrength && !!unit && !!form && !!repeat;
  if (adding)
    return (
      <Shell title="Add prescription" onBack={() => setAdding(false)}>
        <Field
          label="Medication name"
          value={name}
          set={setName}
          error={!validName ? 'Medication name is required.' : undefined}
        />
        <Field
          label="Strength"
          value={strength}
          set={setStrength}
          error={!validStrength ? 'Enter a strength greater than zero.' : undefined}
        />
        <Choice
          title="Strength unit"
          options={['mg', 'g', '%', 'μg', 'iu']}
          value={[unit]}
          pick={(v) => setUnit(v)}
        />
        <Choice
          title="Form"
          options={['Tablet', 'Capsule', 'Liquid', 'Drops', 'Injections', 'Spray', 'mL', 'Patches']}
          value={[form]}
          pick={(v) => setForm(v)}
        />
        <Choice
          title="Repeat every"
          options={['hour', 'day', 'week', 'month']}
          value={[repeat]}
          pick={(v) => setRepeat(v)}
        />
        <ActionButton
          label="Save prescription"
          disabled={!ready}
          onPress={() => {
            if (ready) {
              setList((v) => [...v, `${name} ${strength} ${unit} — Every ${repeat}`]);
              setAdding(false);
              setName('');
              setStrength('');
            }
          }}
        />
      </Shell>
    );
  return (
    <Shell title="My Prescriptions" onBack={() => router.replace('/explore')}>
      <Text style={s.copy}>
        {list.length ? 'Your prescribed medications' : 'Prescription list is empty'}
      </Text>
      <View style={s.list}>
        {list.map((m, i) => (
          <View key={`${m}${i}`} style={s.med}>
            <Text style={s.medText}>{m}</Text>
            <Pressable onPress={() => setList((v) => v.filter((_, x) => x !== i))}>
              <Text style={s.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <ActionButton label="Add prescription" onPress={() => setAdding(true)} />
    </Shell>
  );
}
function Shell({
  title,
  children,
  onBack = () => router.back(),
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
function Field({
  label,
  value,
  set,
  error,
  editable = true,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  error?: string;
  editable?: boolean;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftDate, setDraftDate] = useState(new Date());
  const isPhoneNumber = label.toLowerCase().includes('phone number');
  if (label === 'Appointment date') {
    const toIsoDate = (displayDate: string) => {
      const [day, month, year] = displayDate.split('/');
      return year && month && day ? `${year}-${month}-${day}` : '';
    };
    const fromIsoDate = (isoDate: string) => {
      const [year, month, day] = isoDate.split('-');
      return year && month && day ? `${day}/${month}/${year}` : '';
    };
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (Platform.OS === 'web')
      return (
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>{label}</Text>
          <View style={s.dateField}>
            {createElement('input', {
              type: 'date',
              'aria-label': 'Select appointment date',
              value: toIsoDate(value),
              min: todayIso,
              onChange: (event: { target: { value: string } }) =>
                set(fromIsoDate(event.target.value)),
              style: {
                flex: 1,
                height: 54,
                border: 0,
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: 600,
                color: palette.text,
              },
            })}
          </View>
        </View>
      );
    const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (date)
          set(
            date.toLocaleDateString('en-AU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
          );
      } else if (date) setDraftDate(date);
    };
    const selectedDate = value ? new Date(value.split('/').reverse().join('-')) : new Date();
    const openPicker = () => {
      setDraftDate(selectedDate);
      setShowDatePicker(true);
    };
    const saveDate = () => {
      set(
        draftDate.toLocaleDateString('en-AU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      );
      setShowDatePicker(false);
    };
    return (
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select appointment date"
          onPress={openPicker}
          style={s.dateField}
        >
          <Text style={[s.dateFieldText, !value && s.datePlaceholder]}>
            {value || 'Select appointment date'}
          </Text>
          <Image
            pointerEvents="none"
            source={require('../../assets/icons/iconify-calendar.svg')}
            style={s.calendarIcon}
            contentFit="contain"
          />
        </Pressable>
        {showDatePicker && Platform.OS === 'ios' ? (
          <Modal
            transparent
            presentationStyle="overFullScreen"
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={s.dateModalBackdrop}>
              <View style={s.dateModal}>
                <Text style={s.dateModalTitle}>Select appointment date</Text>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  minimumDate={new Date()}
                  display="inline"
                  accentColor={palette.primary}
                  themeVariant="light"
                  onChange={onDateChange}
                />
                <View style={s.dateModalActions}>
                  <Pressable onPress={() => setShowDatePicker(false)} style={s.dateModalButton}>
                    <Text style={s.dateModalCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveDate} style={[s.dateModalButton, s.dateModalDone]}>
                    <Text style={s.dateModalDoneText}>Done</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : showDatePicker ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            minimumDate={new Date()}
            display="default"
            onChange={onDateChange}
          />
        ) : null}
      </View>
    );
  }
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={(text) => set(isPhoneNumber ? text.replace(/\D/g, '') : text)}
        keyboardType={
          isPhoneNumber || label === 'Year of birth'
            ? 'number-pad'
            : label === 'Strength'
              ? 'decimal-pad'
              : 'default'
        }
        inputMode={
          isPhoneNumber || label === 'Year of birth'
            ? 'numeric'
            : label === 'Strength'
              ? 'decimal'
              : 'text'
        }
        placeholder={label}
        placeholderTextColor="#81798A"
        style={[
          s.input,
          label.includes('Notes') || label.includes('answer')
            ? {
                minHeight: 130,
              }
            : null,
        ]}
        multiline={label.includes('Notes') || label.includes('answer')}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={s.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
function Choice({
  title,
  options,
  value,
  pick,
  multi = false,
}: {
  title?: string;
  options: string[];
  value: string[];
  pick: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <View style={s.choiceWrap}>
      {title ? <Text style={s.choiceTitle}>{title}</Text> : null}
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Pressable key={o} onPress={() => pick(o)} style={[s.choice, on && s.choiceOn]}>
            <Text style={[s.choiceText, on && s.choiceTextOn]}>{o}</Text>
            <View style={[multi ? s.square : s.circle, on && s.mark]}>
              <Text style={s.tick}>{on ? '✓' : ''}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
function AppointmentQuestions({
  options,
  value,
  pick,
  customQuestion,
  setCustomQuestion,
}: {
  options: string[];
  value: string[];
  pick: (v: string) => void;
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
}) {
  const groups = [
    { title: 'Pain location', items: options.slice(0, 2) },
    { title: 'Pain intensity', items: options.slice(2, 6) },
    { title: 'Pain impact', items: options.slice(6, 14) },
    { title: 'Management', items: options.slice(14) },
  ];
  return (
    <View style={{ marginTop: 18 }}>
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
function CompactSelect({
  title,
  options,
  value,
  pick,
}: {
  title: string;
  options: string[];
  value: string[];
  pick: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.selectWrap}>
      <Text style={s.selectLabel}>{title}</Text>
      <Text style={s.optional}>optional</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={[s.selectField, open && s.selectFieldOpen]}
      >
        <Text style={[s.selectValue, !value[0] && s.datePlaceholder]}>
          {value[0] || 'Select healthcare practitioner service'}
        </Text>
        <Text style={s.selectChevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <View style={s.selectMenu}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                pick(option);
                setOpen(false);
              }}
              style={[s.selectOption, value[0] === option && s.selectOptionOn]}
            >
              <Text style={[s.selectOptionText, value[0] === option && s.selectOptionTextOn]}>
                {option}
              </Text>
              {value[0] === option ? <Text style={s.selectTick}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
export default function Workflow() {
  const params = useLocalSearchParams<{
    flow?: string;
    fresh?: string;
    step?: string;
    resume?: string;
  }>();
  // Tabs reuse this route: remount the form before rendering another flow's step.
  return (
    <WorkflowForm
      key={`${params.flow ?? 'onboarding'}:${params.fresh ?? ''}:${params.step ?? '0'}:${params.resume ?? ''}`}
    />
  );
}
function WorkflowForm() {
  const {
    flow = 'onboarding',
    name: routeName = 'Jane',
    step: initialStep = '0',
    fresh,
    returnTo,
    resume,
    doctor: resumeDoctor,
    date: resumeDate,
    service: resumeService,
    support: resumeSupport,
    customQuestion: resumeCustomQuestion,
    questions: resumeQuestions,
  } = useLocalSearchParams<{
    flow: string;
    name?: string;
    step?: string;
    returnTo?: string;
    fresh?: string;
    resume?: string;
    doctor?: string;
    date?: string;
    service?: string;
    support?: string;
    customQuestion?: string;
    questions?: string;
  }>();
  const data = flows[flow] ?? flows.settings;
  const [step, setStep] = useState(workflowStep(initialStep, data.steps.length)),
    [values, setValues] = useState<Record<number, string[]>>({}),
    [fields, setFields] = useState<Record<string, string>>({}),
    [recordedUri, setRecordedUri] = useState<string>();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  useEffect(() => {
    if (flow !== 'appointment') return;
    setStep(workflowStep(initialStep, data.steps.length));
    if (resume) {
      setValues({
        0: resumeService && resumeService !== 'Not added' ? [resumeService] : [],
        2: resumeQuestions ? (JSON.parse(resumeQuestions) as string[]) : [],
      });
      setFields({
        '0-Appointment date': resumeDate ?? '',
        '0-Doctor’s name': resumeDoctor ?? '',
        '1-Support person name': resumeSupport === 'Not added' ? '' : (resumeSupport ?? ''),
        '2-Other question': resumeCustomQuestion ?? '',
      });
    } else {
      setValues({});
      setFields({});
    }
    setRecordedUri(undefined);
  }, [
    data.steps.length,
    flow,
    initialStep,
    fresh,
    resume,
    resumeDoctor,
    resumeDate,
    resumeService,
    resumeSupport,
    resumeCustomQuestion,
    resumeQuestions,
  ]);
  const [week] = useState(() => reflectionWeek());
  const [loadingReflection, setLoadingReflection] = useState(flow === 'reflection');
  const [saving, setSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const destination =
    returnTo === '/explore' || returnTo === '/care' || returnTo === '/dashboard'
      ? returnTo
      : flow === 'reflection'
        ? '/dashboard'
        : '/care';
  const leaveFlow = useCallback(() => router.replace(destination), [destination]);
  useFocusEffect(
    useCallback(() => {
      if (flow !== 'reflection' && flow !== 'tips') return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        leaveFlow();
        return true;
      });
      return () => subscription.remove();
    }, [flow, leaveFlow]),
  );
  useEffect(() => {
    if (flow !== 'reflection') return;
    let active = true;
    getReflection(week)
      .then((saved) => {
        if (active) setFields({ '0-Notes': saved?.notes ?? '' });
      })
      .catch(() => {
        if (active)
          setReflectionError(
            'Unable to load your saved reflection. Please reopen this screen to retry.',
          );
      })
      .finally(() => {
        if (active) setLoadingReflection(false);
      });
    return () => {
      active = false;
    };
  }, [flow, week]);
  if (flow === 'prescriptions') return <Prescriptions />;
  const current = data.steps[step],
    selected = values[step] ?? [];
  const userName = fields['3-Type your name']?.trim() || routeName || 'Jane';
  const displayTitle = current.title.replace('Jane', userName);
  const displayCopy =
    flow === 'reflection'
      ? `Write down any reflections on your pain experience and management this week. Week beginning ${week}. Your saved notes can be viewed and edited here.`
      : current.copy.replaceAll('Jane', userName);
  const pick = (v: string) => {
    if (flow === 'onboarding' && current.title === 'I am a' && v === 'Support person') {
      router.replace('/support-home');
      return;
    }
    setValues((a) => ({
      ...a,
      [step]: current.multi
        ? selected.includes(v)
          ? selected.filter((x) => x !== v)
          : [...selected, v]
        : [v],
    }));
  };
  const requiredFields =
    current.fields?.every((f) => validAnswer(f, fields[`${step}-${f}`])) ?? true;
  const ready =
    (current.optional && flow !== 'onboarding' && flow !== 'reflection') ||
    ((!current.options || current.optionsOptional || selected.length > 0) && requiredFields);
  const next = async () => {
    if (flow === 'reflection') {
      if (!ready || saving || loadingReflection || reflectionError) return;
      setSaving(true);
      try {
        await saveReflection(fields['0-Notes'] ?? '', week);
        leaveFlow();
      } catch {
        Alert.alert('Reflection not saved', 'Your notes are still here. Please try saving again.');
      } finally {
        setSaving(false);
      }
      return;
    }
    if (flow === 'onboarding' && current.title === 'Thank you, Jane 😃') {
      router.replace({
        pathname: '/onboarding-loading',
        params: { name: userName },
      });
      return;
    }
    if (flow === 'appointment' && current.title === 'Add Questions for My Appointment') {
      const customQuestion = fields['2-Other question']?.trim();
      const groupedQuestions = selected.map((text) => {
        const index = current.options?.indexOf(text) ?? -1;
        return {
          group:
            index < 2
              ? 'Pain location'
              : index < 6
                ? 'Pain intensity'
                : index < 14
                  ? 'Pain impact'
                  : 'Management',
          text,
        };
      });
      router.push({
        pathname: '/appointment-review',
        params: {
          mode: 'plan',
          doctor: fields['0-Doctor’s name']?.trim() || 'Healthcare practitioner',
          date: fields['0-Appointment date'] || 'Date not specified',
          service: values[0]?.[0] || 'Not added',
          support: fields['1-Support person name']?.trim() || 'Not added',
          customQuestion: customQuestion || '',
          questions: JSON.stringify(selected),
          questionData: JSON.stringify(groupedQuestions),
        },
      });
      return;
    }
    if (flow === 'appointment' && current.title === 'Review My Appointment Plan') {
      addAppointment({
        doctor: fields['0-Doctor’s name']?.trim() || 'Healthcare practitioner',
        date: fields['0-Appointment date'] || 'Date not specified',
        service: values[0]?.[0] || 'Health service not specified',
      });
      router.replace('/care');
      return;
    }
    if (flow === 'tips' && step === 0 && selected.length) {
      const urls: Record<string, string> = {
        'Understanding pain': 'https://muscha.org/pain-guide/',
        'Exercise and movement': 'https://muscha.org/exercise',
        'Living well with a musculoskeletal condition':
          'https://muscha.org/living-well-with-a-musculoskeletal-condition',
        'Relaxation and emotions': 'https://muscha.org/relaxation/',
      };
      try {
        await Linking.openURL(urls[selected[0]]);
      } catch {
        Alert.alert('Unable to open pain guide', 'Please try again.');
      }
      return;
    }
    if (step < data.steps.length - 1) setStep(step + 1);
    else if (flow === 'onboarding' || flow === 'login')
      router.replace({ pathname: '/dashboard', params: { name: userName } });
    else
      router.replace(
        flow === 'support' || flow === 'support-detail' || flow === 'archive' || flow === 'join'
          ? '/support-home'
          : '/care',
      );
  };
  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
        if (recorder.uri) setRecordedUri(recorder.uri);
        else Alert.alert('Recording not saved', 'Please try recording the answer again.');
        return;
      }
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
      Alert.alert('Recording unavailable', 'Please check microphone access and try again.');
    }
  };
  const flowLabel = data.eyebrow ? `${data.eyebrow} · ` : '';
  const goBack =
    flow === 'onboarding'
      ? () => (step ? setStep(step - 1) : router.replace('/splash'))
      : flow === 'login'
        ? () => (step ? setStep(step - 1) : router.replace('/login'))
        : flow === 'appointment'
          ? () => (step ? setStep(step - 1) : router.replace('/care'))
          : flow === 'reflection' || flow === 'tips'
            ? leaveFlow
            : undefined;
  return (
    <>
      <StatusBar hidden={flow === 'onboarding'} />
      <Shell title={displayTitle} onBack={goBack}>
        <Text style={s.flowEyebrow}>
          {flowLabel}
          {step + 1}/{data.steps.length}
        </Text>
        <Text style={s.copy}>{displayCopy}</Text>
        {loadingReflection ? <Text style={s.copy}>Loading reflection…</Text> : null}
        {reflectionError ? <Text style={s.fieldError}>{reflectionError}</Text> : null}
        {current.optionsBeforeFields && current.options ? (
          <Choice options={current.options} value={selected} pick={pick} multi={current.multi} />
        ) : null}
        {current.fields?.map((f) => (
          <Field
            key={f}
            label={f}
            editable={!loadingReflection && !saving && !reflectionError}
            value={fields[`${step}-${f}`] ?? ''}
            set={(v) =>
              setFields((x) => ({
                ...x,
                [`${step}-${f}`]: v,
              }))
            }
          />
        ))}
        {current.title === 'Add doctor’s answer' ? (
          <View style={s.voiceWrap}>
            <Pressable
              accessibilityRole="button"
              onPress={toggleRecording}
              style={[s.voiceButton, recorderState.isRecording && s.voiceButtonOn]}
            >
              <Text style={s.voiceIcon}>{recorderState.isRecording ? '■' : '●'}</Text>
              <Text style={s.voiceText}>
                {recorderState.isRecording ? 'Stop voice recording' : 'Start voice recording'}
              </Text>
            </Pressable>
            {recordedUri ? <Text style={s.recorded}>✓ Voice answer recorded</Text> : null}
          </View>
        ) : flow === 'appointment' && step === 2 && current.options ? (
          <AppointmentQuestions
            options={current.options}
            value={selected}
            pick={pick}
            customQuestion={fields['2-Other question'] ?? ''}
            setCustomQuestion={(value) =>
              setFields((previous) => ({
                ...previous,
                '2-Other question': value,
              }))
            }
          />
        ) : flow === 'appointment' && step === 0 && current.options ? (
          <CompactSelect
            title="Health services"
            options={current.options}
            value={selected}
            pick={pick}
          />
        ) : current.options && !current.optionsBeforeFields ? (
          <Choice options={current.options} value={selected} pick={pick} multi={current.multi} />
        ) : null}
        <View style={s.footer}>
          <ActionButton
            label={
              saving
                ? 'Saving…'
                : flow === 'tips'
                  ? 'Open pain guide'
                  : (current.action ?? (step === data.steps.length - 1 ? 'Save' : 'Continue'))
            }
            disabled={!ready || saving || loadingReflection || !!reflectionError}
            onPress={next}
          />
          {current.optional && flow !== 'reflection' ? (
            <Pressable onPress={next}>
              <Text style={s.skip}>Skip</Text>
            </Pressable>
          ) : !ready ? (
            <Text style={s.required}>Complete the required information to continue.</Text>
          ) : null}
        </View>
      </Shell>
    </>
  );
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  back: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 14,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.primary,
    marginTop: 6,
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: palette.text,
    marginTop: 8,
    marginBottom: 8,
  },
  flowEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.primary,
    marginTop: 5,
  },
  copy: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
    marginTop: 10,
    marginBottom: 16,
  },
  fieldError: { color: palette.error, fontSize: 12, marginTop: 6 },
  fieldWrap: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 7,
  },
  dateField: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFieldText: { fontSize: 15, fontWeight: '600', color: palette.text },
  datePlaceholder: { color: '#81798A', fontWeight: '400' },
  calendarIcon: { width: 24, height: 24, tintColor: palette.primary },
  selectWrap: { marginTop: 14 },
  selectLabel: { fontSize: 12, fontWeight: '700', color: palette.text },
  optional: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: palette.muted,
    marginTop: 4,
    marginBottom: 8,
  },
  selectField: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectFieldOpen: {
    borderColor: palette.secondary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  selectValue: { flex: 1, fontSize: 14, lineHeight: 20, color: palette.text },
  selectChevron: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '800',
    color: palette.text,
  },
  selectMenu: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  selectOption: {
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  selectOptionOn: { backgroundColor: '#D8C7FA' },
  selectOptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text,
  },
  selectOptionTextOn: { fontWeight: '700', color: palette.primaryDark },
  selectTick: { fontSize: 15, fontWeight: '800', color: palette.primary },
  dateModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32,26,43,0.36)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  dateModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    shadowColor: '#201A2B',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
  },
  dateModalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  dateModalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dateModalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateModalCancel: { fontSize: 14, fontWeight: '700', color: palette.muted },
  dateModalDone: { backgroundColor: palette.primary },
  dateModalDoneText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  input: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 15,
    color: palette.text,
    textAlignVertical: 'top',
  },
  choiceWrap: {
    gap: 12,
    marginVertical: 16,
  },
  choiceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 2,
  },
  choice: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 17,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceOn: {
    backgroundColor: '#F3EEFF',
    borderColor: '#BEA1F7',
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text,
    paddingRight: 10,
  },
  choiceTextOn: {
    fontWeight: '700',
    color: palette.primaryDark,
  },
  circle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B9AFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B9AFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  tick: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  footer: {
    marginTop: 32,
  },
  skip: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
    textAlign: 'center',
    padding: 16,
  },
  required: {
    fontSize: 12,
    fontWeight: '400',
    color: palette.text,
    textAlign: 'center',
    marginTop: 10,
  },
  voiceWrap: { marginTop: 14, gap: 10 },
  voiceButton: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: '#F7F4FC',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  voiceButtonOn: { backgroundColor: '#D8C7FA', borderColor: palette.secondary },
  voiceIcon: { fontSize: 16, color: palette.primary },
  voiceText: { fontSize: 14, fontWeight: '800', color: palette.primary },
  recorded: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.success,
    textAlign: 'center',
  },
  list: {
    gap: 12,
    marginVertical: 18,
  },
  med: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: palette.text,
  },
  remove: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3131',
    padding: 8,
  },
});
