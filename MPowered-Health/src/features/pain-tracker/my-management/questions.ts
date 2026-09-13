import type { AssessmentDefinition } from '@/features/pain-tracker/shared/assessment/types';
export const definition: AssessmentDefinition = {
  title: 'My Management',
  tip: 'Explore tips on managing pain',
  summary: 'You mainly perform exercises to manage your pain and consume Vitamin D3 daily.',
  questions: [
    {
      title: 'Medication',
      prompt: 'Over the past week, select medications that you consumed to manage your pain.',
      kind: 'multi',
      optional: true,
      helper:
        'Not taking medications? You can continue without selecting an option. This list is generated from your medication records.',
      options: [
        'Perindopril arginine 5 mg — Once daily',
        'Candesartan 16 mg — Once daily',
        'Amlodipine 5 mg — Once daily',
        'Vitamin D3 1000 IU — Once daily',
        'Raloxifene 60 mg — Once daily',
      ],
    },
    {
      title: 'Medication',
      prompt: 'Over the past week, did you take any over-the-counter (OTC) medication?',
      kind: 'text',
      optional: true,
      helper: 'Not taking OTC medication? You can continue without entering a medication.',
    },
    {
      title: 'Exercise',
      prompt:
        'In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?',
      kind: 'single',
      helper:
        'Examples include walking, stretching, strengthening, yoga, resistance-band work, or balance exercises.',
      options: ['0 days', '1–2 days', '3–4 days', '5–6 days', '7 days'],
    },
    {
      title: 'Emotion',
      prompt:
        'Over the past week, did you perform any strategies to manage your stress level or emotion?',
      kind: 'text',
      optional: true,
      helper: 'Examples include meditation, journaling, or meeting with people.',
    },
  ],
};
