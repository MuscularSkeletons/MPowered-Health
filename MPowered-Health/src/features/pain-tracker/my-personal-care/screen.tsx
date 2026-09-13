import AssessmentScreen from '@/features/pain-tracker/shared/assessment/screen';
import { definition } from './questions';
import { summarize } from './summary';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: () => 'Period: 18–24 May',
  savedLabel: 'Saved to Care Journal',
  tipUrl: 'https://muscha.org/living-well-with-a-musculoskeletal-condition',
};
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="personal"
      definition={definition}
      summarize={summarize}
      presentation={presentation}
    />
  );
}
