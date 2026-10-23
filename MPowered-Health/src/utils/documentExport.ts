import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

/** Provides native printing, document sharing, and clipboard helpers */

/** Opens a printable document from HTML using this platform’s printing support */
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

/** Shares a document using this platform’s available sharing support */
export async function shareDocument(report: {
  title: string;
  html: string;
  text: string;
}): Promise<'done' | 'copy'> {
  // Prefer a real PDF attachment when the device exposes file sharing
  if (await Sharing.isAvailableAsync()) {
    const { uri } = await Print.printToFileAsync({ html: report.html });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Share ${report.title}`,
    });
  } else {
    // Some simulators and older devices can share text even when file sharing is absent
    await Share.share({ title: report.title, message: report.text });
  }
  return 'done';
}

/** Copies text to the clipboard */
export async function copyText(_text: string): Promise<boolean> {
  // Native profile actions do not show a copy option; the web module implements it
  return false;
}

/**
 * Escapes special characters so user text is safe to place in an HTML report
 * User-entered labels must be escaped before they are inserted into the print document
*/
export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });