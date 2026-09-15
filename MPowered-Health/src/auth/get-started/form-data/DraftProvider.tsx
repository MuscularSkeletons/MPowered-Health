import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { registrationReducer, type RegistrationAction, type RegistrationDraft } from './draft';
export type { RegistrationDraft } from './draft';
const Context = createContext<{
  draft: RegistrationDraft;
  dispatch: React.Dispatch<RegistrationAction>;
} | null>(null);

/** Keeps the Get Started answers available while moving between questions. */
export function RegistrationProvider({
  children,
  initial = { fields: {}, values: {} },
}: {
  children: ReactNode;
  initial?: RegistrationDraft;
}) {
  // Initial values are read when this provider mounts; the route layout decides when to start fresh.
  const [draft, dispatch] = useReducer(registrationReducer, initial);
  return <Context.Provider value={{ draft, dispatch }}>{children}</Context.Provider>;
}

/** Reads the current Get Started answers and the actions that update them. */
export function useRegistration() {
  const state = useContext(Context);
  // Fail clearly if a screen is rendered outside the matching layout/provider.
  if (!state) throw new Error('RegistrationProvider is required');
  return state;
}
