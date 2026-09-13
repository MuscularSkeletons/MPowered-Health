import { Step } from '@/features/auth/models/registration-step';
export const appointment: { eyebrow: string; steps: Step[] } = {
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
      title: 'Add Questions for My Appointment',
      copy: 'We have provided some suggested questions to ask your healthcare professional/s.',
      multi: true,
      optional: true,
    },
  ],
};
