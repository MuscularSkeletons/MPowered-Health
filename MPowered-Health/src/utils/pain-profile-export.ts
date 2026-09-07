import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { PainProfileReport, profileReportHtml, profileReportText } from './pain-profile-report';

export async function printHtml(html: string): Promise<void> {
  try {
    await Print.printAsync({ html });
  } catch (error) {
    // Expo on iOS rejects with this message when the user dismisses printing.
    if (error instanceof Error && error.message === 'Printing did not complete') return;
    throw error;
  }
}

export function printProfile(report: PainProfileReport) {
  return printHtml(profileReportHtml(report));
}

export async function shareProfile(report: PainProfileReport): Promise<'done' | 'copy'> {
  if (await Sharing.isAvailableAsync()) {
    const { uri } = await Print.printToFileAsync({ html: profileReportHtml(report) });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share My Pain Profile',
    });
  } else {
    await Share.share({ title: 'My Pain Profile', message: profileReportText(report) });
  }
  return 'done';
}

export async function copyProfile(_text: string): Promise<boolean> {
  return false;
}
