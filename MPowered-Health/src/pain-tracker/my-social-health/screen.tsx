import AssessmentScreen from '@/pain-tracker/shared/screen';
import { definition } from './questions';
import { summarize } from '@/shared/health-records/summaries/social-health';
import {
  currentAssessmentPeriod,
  saveAssessmentRecord,
} from '@/shared/health-records/assessment-repository';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: currentAssessmentPeriod,
  tipUrl: 'https://muscha.org/relaxation/',
};

/** Connects the My social health questions and summary to the shared assessment screen. */
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="social"
      definition={definition}
      summarize={summarize}
      persist={(answers) => saveAssessmentRecord('social', answers)}
      presentation={presentation}
    />
  );
}
