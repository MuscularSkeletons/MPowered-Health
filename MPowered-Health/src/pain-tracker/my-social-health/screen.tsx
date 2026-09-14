import AssessmentScreen from '@/pain-tracker/shared/screen';
import { definition } from './questions';
import { summarize } from '@/shared/health-records/summaries/social-health';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: () => 'Period: 18–24 May',
  savedLabel: 'Saved to Care Journal',
  tipUrl: 'https://muscha.org/relaxation/',
};
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="social"
      definition={definition}
      summarize={summarize}
      presentation={presentation}
    />
  );
}
