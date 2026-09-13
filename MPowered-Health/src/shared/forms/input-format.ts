export const fourDigits = (input: string) => input.replace(/\D/g, '').slice(0, 4);
export const isFourDigits = (value: string) => /^\d{4}$/.test(value);
