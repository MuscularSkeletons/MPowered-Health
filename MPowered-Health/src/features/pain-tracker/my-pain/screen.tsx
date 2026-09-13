import AssessmentScreen from '@/features/pain-tracker/shared/assessment/screen';
import { definition } from './questions';
import { summarize } from './summary';
import { getPainHistory, painRecordDate, savePainAssessment } from './history';
import { PainSummaryResults } from './SummaryResults';
import type { SummaryPresentation } from '@/features/pain-tracker/shared/assessment/summary/Summary';
const presentation: SummaryPresentation = {
  intro: definition.summary,
  period: () => {
    const latest = getPainHistory().at(-1);
    return latest ? `Recorded ${painRecordDate(latest)}` : 'My Pain assessment';
  },
  savedLabel: 'Saved to My Health',
  repeatable: true,
  renderResults: (answers) => <PainSummaryResults answers={answers} />,
};
export default function Screen() {
  return (
    <AssessmentScreen
      assessmentId="pain"
      definition={definition}
      summarize={summarize}
      persist={savePainAssessment}
      presentation={presentation}
    />
  );
}
