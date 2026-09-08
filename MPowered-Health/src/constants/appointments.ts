// This file stores planned appointments and their questions in app memory.
// Appointment records stay in memory and are copied when read to prevent accidental edits.
export type AppointmentQuestion = { group: string; text: string };
export type PlannedAppointment = {
  id: string;
  doctor: string;
  date: string;
  service: string;
  questions?: AppointmentQuestion[];
  signaturePaths?: string[];
};
let appointments: PlannedAppointment[] = [
  // Keep one example appointment so the unfinished prototype has useful content.
  {
    id: 'seed-appointment',
    doctor: 'Dr. Maximiliano Prinzi',
    date: '10 June 2026',
    service: 'General Practitioner (GP)',
  },
];
// Return a new list so callers cannot replace entries in the shared store directly.
export const getAppointments = () => [...appointments];
// An omitted or stale route ID falls back to the first available appointment.
export const getAppointment = (id?: string) =>
  appointments.find((item) => item.id === id) ?? appointments[0];
export const addAppointment = (appointment: Omit<PlannedAppointment, 'id'>) => {
  // Time-based IDs are sufficient for appointments created one at a time in this prototype.
  appointments = [...appointments, { ...appointment, id: `appointment-${Date.now()}` }];
};
export const saveAppointmentSignature = (id: string, signaturePaths: string[]) => {
  // Copy the paths because the signature pad continues to own its working array.
  appointments = appointments.map((item) =>
    item.id === id ? { ...item, signaturePaths: [...signaturePaths] } : item,
  );
};

export function resetAppointments() {
  // Account deletion must also remove appointment data held only in memory.
  appointments = [];
}
