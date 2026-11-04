/** Convert a given string into a capitalised sentence */
export const asSentence = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;