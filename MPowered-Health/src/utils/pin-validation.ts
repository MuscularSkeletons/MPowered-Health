// This file accepts only four-digit PIN values and removes invalid characters.
// Validate before saving, then clean pasted input before it reaches the form state.
export const isValidPin = (pin: string) => /^\d{4}$/.test(pin);
export const pinDigits = (input: string) => input.replace(/\D/g, '').slice(0, 4);
