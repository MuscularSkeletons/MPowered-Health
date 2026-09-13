import type { AssessmentDefinition } from '@/features/pain-tracker/shared/assessment/types';
export const definition: AssessmentDefinition = {
  title: 'My Personal Care',
  tip: 'Explore tips on daily living',
  summary:
    'Pain is currently having a significant impact on your personal care. With the right care and guidance, these tasks can become more manageable over time.',
  questions: [
    {
      title: 'General Activities Impacts',
      prompt: 'Select ALL relevant statements:',
      kind: 'multi',
      options: [
        'I am not doing any jobs that I usually do around the house',
        'I get dressed more slowly than usual because of my pain',
        'I sleep less well because of my pain',
        'I am more irritable and bad tempered with people than usual',
        'I try to get other people to do things for me because of my pain',
      ],
    },
    {
      title: 'Personal care (washing, dressing, etc.)',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: [
        'I can look after myself normally without causing extra pain',
        'I can look after myself normally, but it causes extra pain',
        'It is painful to look after myself and I am slow and careful',
        'I need some help but manage most of my personal care',
        'I need help every day with most aspects of self-care',
        'I do not get dressed, wash with difficulty and stay in bed',
      ],
    },
    {
      title: 'Sleeping',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: [
        'My sleep is never disturbed by pain',
        'My sleep is occasionally disturbed by pain',
        'Because of pain I have less than 6 hours of sleep',
        'Because of pain I have less than 4 hours of sleep',
        'Because of pain I have less than 2 hours of sleep',
        'Pain prevents me from sleeping at all',
      ],
    },
    {
      title: 'Reflection on your personal care',
      prompt: 'Write any reflections of pain impacts on your daily life.',
      kind: 'text',
      optional: true,
      helper:
        'For instance, you may have felt unable to complete everyday tasks, such as doing the laundry.',
    },
  ],
};
