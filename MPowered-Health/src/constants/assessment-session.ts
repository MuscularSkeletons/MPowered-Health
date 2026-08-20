const completedAssessments = new Set<string>();
export type PainRecord={date:string;score:number};
const painRecords:PainRecord[]=[{date:'25/05',score:5},{date:'01/06',score:5},{date:'08/06',score:7}];

export function markAssessmentCompleted(type: string) {
  completedAssessments.add(type);
}

export function getCompletedAssessments() {
  return [...completedAssessments];
}

export function addPainRecord(score:number) {
  const now=new Date();
  const date=`${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  painRecords.push({date,score:Math.max(0,Math.min(10,score))});
}

export function getPainRecords() {
  return [...painRecords];
}
