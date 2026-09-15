/** Defines the question wording and answer choices used by Pain Tracker / My Movement. */
import type { AssessmentDefinition } from '@/shared/health-records/assessment-types';
const scales = {
  walk: [
    'Pain does not prevent me walking any distance',
    'Pain prevents me from walking more than 2 kilometres',
    'Pain prevents me from walking more than 1 kilometre',
    'Pain prevents me from walking more than 500 metres',
    'I can only walk using a stick or crutches',
    'I am in bed most of the time',
  ],
  lift: [
    'I can lift heavy weights without extra pain',
    'I can lift heavy weights, but it causes extra pain',
    'I struggle to lift heavy weights off the floor, but I can lift them from a table',
    'I struggle to lift heavy weights off the floor, but I can lift medium weights from a table',
    'I can lift only very light weights',
    'I cannot lift or carry anything at all',
  ],
  sit: [
    'I can sit in any chair as long as I like',
    'I can only sit in my favourite chair as long as I like',
    'Pain prevents me sitting more than one hour',
    'Pain prevents me sitting more than 30 minutes',
    'Pain prevents me from sitting more than 10 minutes',
    'Pain prevents me from sitting at all',
  ],
  stand: [
    'I can stand as long as I want without increased pain',
    'I can stand as long as I want, but it increases my pain',
    'Pain prevents me standing more than one hour',
    'Pain prevents me standing more than 30 minutes',
    'Pain prevents me from standing more than 10 minutes',
    'Pain prevents me from standing at all',
  ],
};

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
