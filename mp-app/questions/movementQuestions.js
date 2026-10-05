// Scale options used across multiple questions
export const movementScales = {
  walk: [
    'Pain does not prevent me walking any distance',
    'Pain prevents me from walking more than 1 kilometre',
    'Pain prevents me from walking more than 500 metres',
    'Pain prevents me from walking more than 100 metres',
    'I can only walk using a stick or crutches',
    'I am in bed most of the time and have to crawl to the toilet',
  ],
  lift: [
    'I can lift heavy weights without extra pain',
    'I can lift heavy weights, but it gives extra pain',
    'I struggle to lift weights off the floor, but I can lift them from a table',
    'I struggle to lift weights off the floor, but I can lift medium weights on the table',
    'I can lift very light weights',
    'I cannot lift or carry anything at all',
  ],
  sit: [
    'I can sit in any chair as long as I like',
    'I can only sit in my favourite chair as long as I like',
    'Pain prevents me sitting more than 1 hour',
    'Pain prevents me sitting more than 30 minutes',
    'Pain prevents me sitting more than 10 minutes',
    'Pain prevents me from sitting at all',
  ],
  stand: [
    'I can stand as long as I want without extra pain',
    'I can stand as long as I want, but it gives me extra pain',
    'Pain prevents me from standing for more than 1 hour',
    'Pain prevents me from standing for more than 30 minutes',
    'Pain prevents me from standing for more than 10 minutes',
    'Pain prevents me from standing at all',
  ],
};

export const movementQuestions = {
  title: 'My Movement',
  tip: 'Explore tips on managing movement',

  calculateScore: (answers) => {
    const { totalScore, impactLevel } = calculateMovementScore(answers);
    return {
      extraFields: {
        movement_score: totalScore,
        impact_level: impactLevel,
      },
      summaryMessage: impactLevel,
    };
  },
    questions: [
    {
      id: 'active_hour',
      title: 'General Movement Impacts',
      prompt:
        'On average, how many hours per day were you able to stay active or mobile last week?',
      kind: 'single',
      options: [
        'Less than 1 hour',
        '1 - 2 hours',
        '3 - 4 hours',
        '5 - 6 hours',
        '7+ hours',
        ],
      helper:
        'Staying active could mean doing your typical activities, such as working, driving, doing household chores, or meeting with people.',
    },
    {
      id: 'general_impacts',
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
      id: 'walking_impact',
      title: 'Walking Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: movementScales.walk,
    },
    {
      id: 'lifting_impact',
      title: 'Lifting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: movementScales.lift,
    },
    {
      id: 'sitting_impact',
      title: 'Sitting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: movementScales.sit,
    },
    {
      id: 'standing_impact',
      title: 'Standing Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: movementScales.stand,
    },
    {
      id: 'movement_reflection',
      title: 'Reflection on your movement',
      prompt: 'Write any reflections of pain impacts on your mobility.',
      kind: 'text',
      optional: true,
      helper:
        'For instance, when pain occurred, you may have needed to lie down for the whole day.',
    },
  ],
};

/**
 * Calculates scores for Walking, Lifting, Sitting, and Standing sections (0 to 5 each).
 * First option = 0, Last option = 5.
 */
function getSectionScore(selectedValue, scaleList) {
  if (!selectedValue || !Array.isArray(scaleList) || scaleList.length <= 1) {
    return 0;
  }
  const index = scaleList.indexOf(selectedValue);
  return index === -1 ? 0 : index;
}

export function calculateMovementScore(answers) {
  const walkingScore = getSectionScore(answers.walking_impact, movementScales.walk);
  const liftingScore = getSectionScore(answers.lifting_impact, movementScales.lift);
  const sittingScore = getSectionScore(answers.sitting_impact, movementScales.sit);
  const standingScore = getSectionScore(answers.standing_impact, movementScales.stand);

  // Each answer weighted 1 point
  const generalScore = Array.isArray(answers.general_impacts) ? answers.general_impacts.length : 0;

  const totalScore = walkingScore + liftingScore + sittingScore + standingScore + generalScore;

  let impactLevel = '';

  if (totalScore <= 5) {
    impactLevel = 'Your answers indicate that pain does not really impact your movement.';
  } else if (totalScore > 5 && totalScore <= 10) {
    impactLevel = 'Your answers indicate that pain mildly impacts your movement.';
  } else if (totalScore > 10 && totalScore <= 15) {
    impactLevel = 'Your answers indicate that pain moderately impacts your movement.';
  } else if (totalScore > 15) {
    impactLevel = 'Your answers indicate that pain significantly impacts your movement.';
  }

  return { totalScore, impactLevel };
};