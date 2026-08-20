export const productContent = {
  dashboard: {
    description: 'Assess your pain intensity and its impacts weekly to create an empowered plan.',
    progressLabel: "This week's progress",
    assessmentTitle: "This week's assessment",
    assessments: ['My Pain', 'My Movement', 'My Personal Care', 'My Social Health', 'My Management'],
  },
  healthRecords: {
    title: 'My health tracking records',
    metric: 'Pain intensity',
    location: 'Back, knee',
    segments: ['Average', 'Worst', 'Mildest'],
  },
  care: {
    title: 'Plan your visit with confidence',
    description: 'Get ready for your visit. Prepare questions, add support people, and keep notes during your appointments.',
    questionsAction: 'Explore questions generated for me',
    prepareAction: 'Prepare for my appointment',
    appointmentsTitle: 'My Appointments:',
    doctor: 'Dr. Maximiliano Prinzi',
    date: 'Date: 10 June 2026',
  },
  appointmentQuestions: {
    title: 'Add Questions for My Appointment',
    generated: 'Generated on 5 May 2026',
    painLocation: [
      'What could be causing pain in my lower back, neck, and knee?',
      'Are these areas related, or are they likely separate issues?',
    ],
    painIntensity: 'My average pain over the past two weeks has been around 7 — what does this indicate?',
  },
} as const;
