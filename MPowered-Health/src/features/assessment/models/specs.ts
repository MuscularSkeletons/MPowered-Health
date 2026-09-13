type Q = {
  title: string;
  prompt: string;
  kind: 'multi' | 'single' | 'score' | 'number' | 'text';
  options?: string[];
  optional?: boolean;
  helper?: string;
};
export const scales = {
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
// Link each summary to the matching trusted pain-management guide.
export const tipUrls: Record<string, string> = {
  movement: 'https://muscha.org/exercise',
  personal: 'https://muscha.org/living-well-with-a-musculoskeletal-condition',
  social: 'https://muscha.org/relaxation/',
  management: 'https://muscha.org/pain-guide/',
};
// Define each assessment here while sharing the same screen engine below.
export const specs: Record<
  string,
  {
    title: string;
    questions: Q[];
    tip: string;
    summary: string;
  }
> = {
  pain: {
    title: 'My Pain',
    tip: 'Check Pain Guide',
    summary: 'This helps guide your treatment and support your recovery.',
    questions: [
      {
        title: 'Pain location',
        prompt: 'I have had pain in these areas last week.',
        kind: 'multi',
        options: [
          'Head',
          'Neck',
          'Shoulder',
          'Upper Back',
          'Lower Back',
          'Leg',
          'Hip',
          'Buttock',
          'Knee',
          'Other',
        ],
      },
      {
        title: 'Pain characteristics',
        prompt: 'For each of the following words, select the adjectives that apply to your pain.',
        kind: 'multi',
        options: [
          'Aching',
          'Throbbing',
          'Shooting',
          'Stabbing',
          'Gnawing',
          'Sharp',
          'Tender',
          'Burning',
          'Exhausting',
          'Tiring',
          'Penetrating',
          'Nagging',
          'Numb',
          'Miserable',
          'Unbearable',
        ],
      },
      {
        title: 'Pain intensity',
        prompt: 'My current pain is',
        kind: 'score',
      },
      {
        title: 'Pain intensity',
        prompt: 'My mildest pain last week was',
        kind: 'score',
      },
      {
        title: 'Pain intensity',
        prompt: 'My worst pain last week was',
        kind: 'score',
      },
      {
        title: 'Pain intensity',
        prompt: 'My overall average pain last week was',
        kind: 'score',
      },
    ],
  },
  movement: {
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
  },
  personal: {
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
  },
  social: {
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
  },
  management: {
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
  },
};
// Translate numeric pain scores into plain words for the summary.
