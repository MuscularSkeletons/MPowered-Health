// This file stores planned appointments and their questions in app memory.
import type { PainAssessmentRecord } from './pain-history';

// Appointment records stay in memory and are copied when read to prevent accidental edits.
export type AppointmentQuestion = { group: string; text: string };
export type PlannedAppointment = {
  id: string;
  doctor: string;
  date: string;
  service: string;
  questions?: AppointmentQuestion[];
  signaturePaths?: string[];
};
let appointments: PlannedAppointment[] = [
  // Keep one example appointment so the unfinished prototype has useful content.
  {
    id: 'seed-appointment',
    doctor: 'Dr. Maximiliano Prinzi',
    date: '10 June 2026',
    service: 'General Practitioner (GP)',
  },
];

// Join body areas using normal sentence punctuation for a question the user can read aloud.
function describeAreas(areas: string[]) {
  const names = areas.map((area) => area.trim().toLocaleLowerCase('en-AU')).filter(Boolean);
  if (names.length < 2) return names[0] ?? 'painful area';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}

// Personalize suggested questions from the newest saved My Pain assessment.
// Generic wording is used only when the user has not completed that assessment yet.
export function buildAppointmentQuestions(
  latest?: Pick<PainAssessmentRecord, 'areas' | 'current' | 'mildest' | 'worst' | 'average'>,
): AppointmentQuestion[] {
  const areas = describeAreas(latest?.areas ?? []);
  const locationQuestions = latest
    ? [
        `What could be causing pain in my ${areas}?`,
        latest.areas.length > 1
          ? `Could the pain in my ${areas} be related, or are these likely separate issues?`
          : `Could the pain in my ${areas} be related to my condition or another health issue?`,
      ]
    : [
        'What could be causing my pain?',
        'Could pain in different areas be related, or are they likely separate issues?',
      ];
  const intensityQuestions = latest
    ? [
        `My average pain last week was ${latest.average} out of 10 — what does this indicate?`,
        `My current pain was ${latest.current} out of 10, and my worst pain last week was ${latest.worst} out of 10. What could explain this pattern?`,
        `My pain ranged from ${latest.mildest} to ${latest.worst} out of 10 last week. Is this variation expected?`,
        'What can I do to better manage days when the pain is high?',
      ]
    : [
        'What does the way my pain changes over time indicate?',
        'What should I track about my pain intensity between appointments?',
        'When should a change in pain intensity need medical attention?',
        'What can I do to better manage days when the pain is high?',
      ];
  const group = (name: string, items: string[]) => items.map((text) => ({ group: name, text }));
  return [
    ...group('Pain location', locationQuestions),
    ...group('Pain intensity', intensityQuestions),
    ...group('Pain impact', [
      'What treatments or therapies could help improve my mobility?',
      'Would physiotherapy or a specific exercise program be appropriate for me?',
      'Are there movements or activities I should avoid right now?',
      'My pain is making it hard to take care of myself independently — what can we do to improve this?',
      'Are there strategies, aids, or supports that could help with daily tasks?',
      'Should we adjust my treatment plan given how much this is affecting my independence?',
      'Is this level of impact typical for my condition?',
      'What options are available to improve my quality of life?',
    ]),
    ...group('Management', [
      'Are there additional investigations or referrals that might help?',
      'How can I prevent the pain from becoming severe again?',
      'What are realistic goals for improving my function and independence?',
    ]),
  ];
}

// Return a new list so callers cannot replace entries in the shared store directly.
export const getAppointments = () => [...appointments];
// An omitted or stale route ID falls back to the first available appointment.
export const getAppointment = (id?: string) =>
  appointments.find((item) => item.id === id) ?? appointments[0];
export const addAppointment = (appointment: Omit<PlannedAppointment, 'id'>) => {
  // Time-based IDs are sufficient for appointments created one at a time in this prototype.
  appointments = [...appointments, { ...appointment, id: `appointment-${Date.now()}` }];
};
export const saveAppointmentSignature = (id: string, signaturePaths: string[]) => {
  // Copy the paths because the signature pad continues to own its working array.
  appointments = appointments.map((item) =>
    item.id === id ? { ...item, signaturePaths: [...signaturePaths] } : item,
  );
};

export function resetAppointments() {
  // Account deletion must also remove appointment data held only in memory.
  appointments = [];
}
