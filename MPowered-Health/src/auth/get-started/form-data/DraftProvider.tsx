// makes those answers available across the screens, so going forward or back doesn’t lose them.

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { registrationReducer, type RegistrationAction, type RegistrationDraft } from './draft';
export type { RegistrationDraft } from './draft';
const Context = createContext<{
  draft: RegistrationDraft;
  dispatch: React.Dispatch<RegistrationAction>;
} | null>(null);
export function RegistrationProvider({
  children,
  initial = { fields: {}, values: {} },
}: {
  children: ReactNode;
  initial?: RegistrationDraft;
}) {
  const [draft, dispatch] = useReducer(registrationReducer, initial);
  return <Context.Provider value={{ draft, dispatch }}>{children}</Context.Provider>;
}
export function useRegistration() {
  const state = useContext(Context);
  if (!state) throw new Error('RegistrationProvider is required');
  return state;
}
