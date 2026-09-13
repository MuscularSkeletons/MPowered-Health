import type { AssessmentDefinition } from '@/features/pain-tracker/shared/assessment/types';
import { scales } from './scales';
export const definition: AssessmentDefinition = {
  title: 'My Movement',
  tip: 'Explore tips on managing movement',
  summary:
    'Your answers indicate that pain is significantly impacting your movement. With the right support and treatment, your movement and mobility can improve.',
  questions: [
    {
      title: 'General Movement Impacts',
      prompt:
        'On average, how many hours per day were you able to stay active or mobile last week?',
      kind: 'number',
      helper:
        'Staying active could mean doing your typical activities, such as working, driving, doing household chores, or meeting with people.',
    },
    {
      title: 'General Movement Impacts',
      prompt: 'Select ALL relevant statements:',
      kind: 'multi',
      options: [
        'I walk more slowly than usual because of my pain',
        'I lie down to rest more often because of my pain',
        'I only stand up for short periods of time because of my pain',
        'I try not to bend or kneel down because of my pain',
        'I find it difficult to get out of a chair because of my pain',
        'I sit down most of the day because of my pain',
      ],
    },
    {
      title: 'Walking Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.walk,
    },
    {
      title: 'Lifting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.lift,
    },
    {
      title: 'Sitting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.sit,
    },
    {
      title: 'Standing Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.stand,
    },
    {
      title: 'Reflection on your movement',
      prompt: 'Write any reflections of pain impacts on your mobility.',
      kind: 'text',
      optional: true,
      helper:
        'For instance, when pain occurred, you may have needed to lie down for the whole day.',
    },
  ],
};
