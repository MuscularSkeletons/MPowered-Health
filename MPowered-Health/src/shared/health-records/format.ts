/** Formats summary text for display as a sentence. */
/** Formats summary text for display as a sentence. */
export const asSentence = (value: string) => {
  if (!value || /[.!?]$/.test(value)) return value;
  const isCompleteStatement =
    /^(I |My |Pain |Because |Are |What |Is |How |Would |Should |Even |There |It |Last week)/.test(
      value,
    );
  return isCompleteStatement ? `${value}.` : value;
};
