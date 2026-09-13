import { copyText, printHtml, shareDocument } from '@/shared/export/document-export';
import { profileReportHtml, profileReportText, type PainProfileReport } from './profile-report';
export const printProfile = (report: PainProfileReport) => printHtml(profileReportHtml(report));
export const shareProfile = (report: PainProfileReport) =>
  shareDocument({
    title: 'My Pain Profile',
    html: profileReportHtml(report),
    text: profileReportText(report),
  });
export const copyProfile = copyText;
