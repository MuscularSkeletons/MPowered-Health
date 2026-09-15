/** Defines the data shapes used by account setup / Get Started / questions; this file does not run a screen. */
export type Step = {
  title: string;
  copy: string;
  fields?: string[];
  options?: string[];
  // Allow Continue without choosing an option (text fields may still be required).
  optionsOptional?: boolean;
  // Some questions place choices above their text inputs.
  optionsBeforeFields?: boolean;
  // Multiple selections use checkboxes; single selections use radio-style circles.
  multi?: boolean;
  // Show Skip independently of the required-field checks used by Continue.
  optional?: boolean;
  action?: string;
};
