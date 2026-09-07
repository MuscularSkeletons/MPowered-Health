import { PainProfileReport, profileReportHtml, profileReportText } from './pain-profile-report';

export function printProfile(report: PainProfileReport): Promise<void> {
  // Expo's web printer ignores HTML. Print an isolated document so navigation,
  // buttons and the scroll container never appear in the PDF.
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.title = 'My Pain Profile print document';
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, {
      position: 'fixed',
      left: '-10000px',
      width: '800px',
      height: '1px',
      border: '0',
    });
    const timeout = setTimeout(() => {
      frame.remove();
      reject(new Error('The print document could not be loaded. Please try again.'));
    }, 15000);
    frame.onload = () => {
      clearTimeout(timeout);
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) throw new Error('The print window is unavailable.');
        // Some browsers return immediately from print(); retain the document
        // until their print dialog closes, with a cleanup fallback.
        const cleanup = setTimeout(() => frame.remove(), 300000);
        printWindow.addEventListener(
          'afterprint',
          () => {
            clearTimeout(cleanup);
            frame.remove();
          },
          { once: true },
        );
        printWindow.focus();
        printWindow.print();
        resolve();
      } catch (error) {
        frame.remove();
        reject(error);
      }
    };
    frame.srcdoc = profileReportHtml(report);
    document.body.appendChild(frame);
  });
}

export async function shareProfile(report: PainProfileReport): Promise<'done' | 'copy'> {
  if (typeof navigator.share !== 'function') return 'copy';
  try {
    // Call directly from the click handler to retain browser user activation.
    await navigator.share({ title: 'My Pain Profile', text: profileReportText(report) });
    return 'done';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return 'done';
    return 'copy';
  }
}

export async function copyProfile(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Older/insecure browsers can still copy from a selected text field.
  }
  const field = document.createElement('textarea');
  const previousFocus = document.activeElement as HTMLElement | null;
  field.value = text;
  Object.assign(field.style, { position: 'fixed', left: '-10000px' });
  document.body.appendChild(field);
  try {
    field.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    previousFocus?.focus();
  }
}
