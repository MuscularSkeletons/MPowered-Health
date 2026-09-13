// This file prints and shares pain-profile reports on native devices.
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

export async function printHtml(html: string): Promise<void> {
  // Let the operating system present its normal printer and PDF destination choices.
  try {
    await Print.printAsync({ html });
  } catch (error) {
    // Expo on iOS rejects with this message when the user dismisses printing.
    if (error instanceof Error && error.message === 'Printing did not complete') return;
    throw error;
  }
}

export async function shareDocument(report: {
  title: string;
  html: string;
  text: string;
}): Promise<'done' | 'copy'> {
  // Prefer a real PDF attachment when the device exposes file sharing.
  if (await Sharing.isAvailableAsync()) {
    const { uri } = await Print.printToFileAsync({ html: report.html });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Share ${report.title}`,
    });
  } else {
    // Some simulators and older devices can share text even when file sharing is absent.
    await Share.share({ title: report.title, message: report.text });
  }
  return 'done';
}

export async function copyText(_text: string): Promise<boolean> {
  // Native profile actions do not show a copy option; the web module implements it.
  return false;
}
