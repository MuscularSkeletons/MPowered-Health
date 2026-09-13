export function parseQuestions(value?: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export function parseGroupedQuestions(value?: string): { group: string; text: string }[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is { group: string; text: string } =>
            !!item &&
            typeof item === 'object' &&
            typeof item.group === 'string' &&
            typeof item.text === 'string',
        )
      : [];
  } catch {
    return [];
  }
}
