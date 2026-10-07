export const perconalCareScales: Record<string, string[]> = {
  washing: [
    'I can look after myself normally without causing extra pain',
    'I can look after myself normally, but it causes extra pain',
    'It is painful to look after myself and I am slow and careful',
    'I need some help but manage most of my personal care',
    'I need help every day with most aspects of self-care',
    'I do not get dressed, wash with difficulty and stay in bed',
  ],

  sleeping: [
    'My sleep is never disturbed by pain',
    'My sleep is occasionally disturbed by pain',
    'Because of pain I have less than 6 hours of sleep',
    'Because of pain I have less than 4 hours of sleep',
    'Because of pain I have less than 2 hours of sleep',
    'Pain prevents me from sleeping at all',
  ],
};

export interface QuestionItem {
  id: string;
  title: string;
  prompt: string;
  kind: 'single' | 'multi' | 'score' | 'number' | 'text';
  options?: string[];
  helper?: string;
  optional?: boolean;
}

export interface PersonalCareQuestionsConfig {
  title: string;
  tip: string;
  calculateScore: (answers: Record<string, any>) => {
    extraFields: Record<string, any>;
    summaryMessage: string;
  };
  questions: QuestionItem[];
}

export const personalCareQuestions: PersonalCareQuestionsConfig = {
  title: 'My Personal Care',
  tip: 'Explore tips on daily living',

  calculateScore: (answers: Record<string, any>) => {
    const { totalScore, impactLevel } = calculatePersonalCareScore(answers);
    return {
      extraFields: {
        care_score: totalScore,
        impact_level: impactLevel,
      },
      summaryMessage: impactLevel,
    };
  },

  questions: [
    {
      id: 'activities_impact',
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
      id: 'personal_care_impact',
      title: 'Personal care (washing, dressing, etc.)',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: perconalCareScales.washing,
    },

    {
      id: 'sleeping_impact',
      title: 'Sleeping',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: perconalCareScales.sleeping,
    },

    {
      id: 'care_reflection',
      title: 'Reflection on your personal care',
      prompt: 'Write any reflections of pain impacts on your daily life.',
      kind: 'text',
      optional: true,
      helper:
        'For instance, you may have felt unable to complete everyday tasks, such as doing the laundry.',
    },
  ],
};

/**
 * Calculates scores for Personal care and Sleeping sections (0 to 5 each).
 * First option = 0, Last option = 5.
 */
function getSectionScore(selectedValue: any, scaleList: string[]): number {
  if (!selectedValue || !Array.isArray(scaleList) || scaleList.length <= 1) {
    return 0;
  }
  const index = scaleList.indexOf(selectedValue);
  return index === -1 ? 0 : index;
}

export function calculatePersonalCareScore(answers: Record<string, any>): {
  totalScore: number;
  impactLevel: string;
} {
  const washingScore = getSectionScore(
    answers.personal_care_impact,
    perconalCareScales.washing
  );
  const sleepingScore = getSectionScore(
    answers.sleeping_impact,
    perconalCareScales.sleeping
  );

  // Each answer weighted 1 point
  const activitiesScore = Array.isArray(answers.activities_impact) ? answers.activities_impact.length : 0;

  const totalScore = washingScore + sleepingScore + activitiesScore;

  let impactLevel = '';

  if (totalScore <= 3) {
    impactLevel =
      'Your answers indicate that pain does not really impact your personal care.';
  } else if (totalScore > 3 && totalScore <= 5) {
    impactLevel =
      'Your answers indicate that pain mildly impacts your personal care.';
  } else if (totalScore > 5 && totalScore <= 10) {
    impactLevel =
      'Your answers indicate that pain moderately impacts your personal care.';
  } else if (totalScore > 10) {
    impactLevel =
      'Your answers indicate that pain significantly impacts your personal care.';
  }

  return { totalScore, impactLevel };
}