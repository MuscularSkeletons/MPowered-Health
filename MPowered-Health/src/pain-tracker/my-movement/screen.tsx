import AssessmentScreen from '@/pain-tracker/shared/screen';
import { definition } from './questions';
import { summarize } from '@/shared/health-records/summaries/movement';
import {
  currentAssessmentPeriod,
  saveAssessmentRecord,
} from '@/shared/health-records/assessment-repository';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: currentAssessmentPeriod,
  tipUrl: 'https://muscha.org/exercise',
};

/** Connects the My movement questions and summary to the shared assessment screen. */
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="movement"
      definition={definition}
      summarize={summarize}
      persist={(answers) => saveAssessmentRecord('movement', answers)}
      presentation={presentation}
    />
  );
}
