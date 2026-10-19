/** Formats and checks four-digit inputs used by PIN entry. */
/** Keeps only the first four numeric digits of the input. */
export const fourDigits = (input: string) => input.replace(/\D/g, '').slice(0, 4);

/** Checks that the input contains exactly four digits. */
export const isFourDigits = (value: string) => /^\d{4}$/.test(value);
