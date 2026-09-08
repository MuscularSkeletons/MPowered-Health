// This file holds reusable product wording shown across the app.
// Group wording by screen so product text can be reviewed without opening each component.
export const productContent = {
  dashboard: {
    description: 'Assess your pain intensity and its impacts weekly to create an empowered plan.',
    progressLabel: "This week's progress",
    assessmentTitle: "This week's assessment",
    assessments: [
      'My Pain',
      'My Movement',
      'My Personal Care',
      'My Social Health',
      'My Management',
    ],
  },
  healthRecords: {
    title: 'My health tracking records',
    metric: 'Pain intensity',
    location: 'Back, knee',
    segments: ['Average', 'Worst', 'Mildest'],
  },
  care: {
    title: 'Plan your visit with confidence',
    description:
      'Get ready for your visit. Prepare questions and keep notes during your appointments.',
    questionsAction: 'Explore questions generated for me',
    prepareAction: 'Prepare for my appointment',
    appointmentsTitle: 'My Appointments:',
    doctor: 'Dr. Maximiliano Prinzi',
    date: 'Date: 10 June 2026',
  },
  appointmentQuestions: {
    title: 'Add Questions for My Appointment',
    description:
      'Suggested questions use the pain areas and intensity scores from the latest My Pain assessment.',
  },
} as const;
