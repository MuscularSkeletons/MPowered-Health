import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  appointmentDraftReducer,
  emptyAppointmentDraft,
  type AppointmentDraft,
  type AppointmentDraftAction,
} from './draft';
const Context = createContext<{
  draft: AppointmentDraft;
  dispatch: React.Dispatch<AppointmentDraftAction>;
} | null>(null);
export function AppointmentDraftProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: AppointmentDraft;
}) {
  const [draft, dispatch] = useReducer(appointmentDraftReducer, initial ?? emptyAppointmentDraft());
  return <Context.Provider value={{ draft, dispatch }}>{children}</Context.Provider>;
}
export function useAppointmentDraft() {
  const value = useContext(Context);
  if (!value) throw new Error('AppointmentDraftProvider is required');
  return value;
}
