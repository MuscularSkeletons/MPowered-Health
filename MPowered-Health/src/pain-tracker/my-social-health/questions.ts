/** Defines the question wording and answer choices used by Pain Tracker / My Social Health. */
import type { AssessmentDefinition } from '@/shared/health-records/assessment-types';
export const definition: AssessmentDefinition = {
  title: 'My Social Health',
  tip: 'Explore tips on managing emotions',
  summary:
    'Your answers indicate that pain limits your ability to enjoy social activities. With the right treatment and support, you can stay more active and connected.',
  questions: [
    {
      title: 'Social life',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: [
        'My social life is normal and gives me no extra pain',
        'My social life is normal but increases the degree of pain',
        'Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports',
        'Pain has restricted my social life and I do not go out as often',
        'Pain has restricted my social life to my home',
        'I have no social life because of pain',
      ],
    },
    {
      title: 'Travelling',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: [
        'I can travel anywhere without pain',
        'I can travel anywhere, but it gives me extra pain',
        'Pain is bad, but I manage journeys over two hours',
        'Pain restricts me to journeys of less than one hour',
        'Pain restricts me to short necessary journeys under 30 minutes',
        'Pain prevents me from travelling except to receive treatment',
      ],
    },
    {
      title: 'Mood',
      prompt: 'Over the past week, how much has pain impacted your mood?',
      kind: 'score',
    },
    {
      title: 'Relation with others',
      prompt:
        'Over the past week, how much has pain interfered with your relationships with other people?',
      kind: 'score',
    },
    {
      title: 'Enjoyment of life',
      prompt: 'Over the past week, how much has pain impacted your ability to enjoy life?',
      kind: 'score',
    },
    {
      title: 'Mood',
      prompt: 'Over the past week, how was your mood generally?',
      kind: 'single',
      options: [
        'I was feeling frustrated',
        'I was feeling sad',
        'I was feeling okay',
        'I was feeling calm',
        'I was feeling delighted',
      ],
      helper: 'Select the option that best describes your mood.',
    },
    {
      title: 'Mood',
      prompt: 'What triggered that mood?',
      kind: 'text',
      optional: true,
      helper: 'For example: delays at work due to pain or being unable to meet with friends.',
    },
  ],
};
