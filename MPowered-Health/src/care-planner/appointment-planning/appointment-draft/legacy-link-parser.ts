/** Reads a list of question text from a link, returning an empty list for invalid data. */

export function parseQuestions(value?: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}
