import AssessmentScreen from '@/pain-tracker/shared/screen';
import { definition } from './questions';
import { summarize } from '@/shared/health-records/summaries/personal-care';
import {
  currentAssessmentPeriod,
  saveAssessmentRecord,
} from '@/shared/health-records/assessment-repository';
const presentation = {
  intro: 'Your answers help your doctor focus on what matters most to your daily life.',
  period: currentAssessmentPeriod,
  tipUrl: 'https://muscha.org/living-well-with-a-musculoskeletal-condition',
};

/** Connects the My personal care questions and summary to the shared assessment screen. */
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="personal"
      definition={definition}
      summarize={summarize}
      persist={(answers) => saveAssessmentRecord('personal', answers)}
      presentation={presentation}
    />
  );
}
