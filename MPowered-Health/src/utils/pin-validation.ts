export const isValidPin = (pin: string) => /^\d{4}$/.test(pin);
export const pinDigits = (input: string) => input.replace(/\D/g, '').slice(0, 4);
