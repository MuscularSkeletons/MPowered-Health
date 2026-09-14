import AssessmentScreen from '@/pain-tracker/shared/assessment/screen';
import { definition } from './questions';
import { summarize } from '@/shared/health-records/summaries/movement';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: () => 'Period: 18–24 May',
  savedLabel: 'Saved to Care Journal',
  tipUrl: 'https://muscha.org/exercise',
};
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="movement"
      definition={definition}
      summarize={summarize}
      presentation={presentation}
    />
  );
}
