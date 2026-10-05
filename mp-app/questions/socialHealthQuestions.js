export const socialScales = {
    life: [
         'My social life is normal and gives me no extra pain',
        'My social life is normal but increases the degree of pain',
        'Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports',
        'Pain has restricted my social life and I do not go out as often',
        'Pain has restricted my social life to my home',
        'I have no social life because of pain',
    ],

    travelling: [
        'I can travel anywhere without pain',
        'I can travel anywhere, but it gives me extra pain',
        'Pain is bad, but I manage journeys over two hours',
        'Pain restricts me to journeys of less than one hour',
        'Pain restricts me to short necessary journeys under 30 minutes',
        'Pain prevents me from travelling except to receive treatment',
    ],

    mood: [
        'I was feeling frustrated',
        'I was feeling sad',
        'I was feeling okay',
        'I was feeling calm',
        'I was feeling delighted',
    ],
};

export const socialHealthQuestions = {
    title: 'My Social Health',
    tip: 'Explore tips on managing emotions',
    
    calculateScore: (answers) => {
        const { totalScore, impactLevel } = calculateSocialScore(answers);
        return {
          extraFields: {
            social_score: totalScore,
            impact_level: impactLevel,
          },
          summaryMessage: impactLevel,
        };
    },
        questions: [
        {   
            id: 'social_life',
            title: 'Social life',
            prompt: 'Select the MOST relevant statement:',
            kind: 'single',
            options: socialScales.life,
        },

        {   
            id: 'travelling',
            title: 'Travelling',
            prompt: 'Select the MOST relevant statement:',
            kind: 'single',
            options: socialScales.travelling,
        },

        {
            id: 'mood_impact',
            title: 'Mood',
            prompt: 'Over the past week, how much has pain impacted your mood?',
            kind: 'score',
        },

        {   
            id: 'relation_impact',
            title: 'Relation with others',
            prompt:
                'Over the past week, how much has pain interfered with your relationships with other people?',
            kind: 'score',
        },

        {   
            id: 'enjoyment_impact',
            title: 'Enjoyment of life',
            prompt: 'Over the past week, how much has pain impacted your ability to enjoy life?',
            kind: 'score',
        },

        {   
            id: 'general_mood',
            title: 'Mood',
            prompt: 'Over the past week, how was your mood generally?',
            kind: 'single',
            helper: 'Select the option that best describes your mood.',
            options: socialScales.mood,
        },

        {   
            id: 'mood_trigger',
            title: 'Mood',
            prompt: 'What triggered that mood?',
            kind: 'text',
            optional: true,
            helper: 'For example: delays at work due to pain or being unable to meet with friends.',
        },
    ],
};

/**
 * Calculates scores for Social life and travelling sections (0 to 5 each).
 * First option = 0, Last option = 5.
 */
function getSectionScore(selectedValue, scaleList) {
  if (!selectedValue || !Array.isArray(scaleList) || scaleList.length <= 1) {
    return 0;
  }
  const index = scaleList.indexOf(selectedValue);
  return index === -1 ? 0 : index;
};

export function calculateSocialScore(answers) {
  const enjoymentScore = Number(answers.enjoyment_impact); // user's answer is already the score
  const relationshipScore = Number(answers.relation_impact);
  const moodScore = Number(answers.mood_impact);
  const socialLifeScore = getSectionScore(answers.social_life, socialScales.life);
  const travellingScore = getSectionScore(answers.travelling, socialScales.travelling);

  const totalScore = enjoymentScore + relationshipScore + moodScore + socialLifeScore + travellingScore;

  let impactLevel = '';

  if (totalScore <= 10) {
    impactLevel = 'Your answers indicate that pain does not really impact your social health';
  } else if (totalScore > 10 && totalScore <= 19) {
    impactLevel = 'Your answers indicate that pain mildly impacts your social health.';
  } else if (totalScore > 20 && totalScore <= 30) {
    impactLevel = 'Your answers indicate that pain moderately impacts your social health.';
  } else if (totalScore > 30) {
    impactLevel = 'Your answers indicate that pain significantly impacts your social health.';
  }

  return { totalScore, impactLevel };
};