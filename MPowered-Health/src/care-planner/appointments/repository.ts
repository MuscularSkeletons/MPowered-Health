/** Keeps planned appointments in memory and clears them during account cleanup. */
import { registerAccountCleanup } from '@/shared/account/repository';
// This file stores planned appointments and their questions in app memory.

// Appointment records stay in memory and are copied when read to prevent accidental edits.
import type { PlannedAppointment } from '@/care-planner/appointments/types';
let appointments: PlannedAppointment[] = [
  // Keep one example appointment so the unfinished prototype has useful content.
  {
    id: 'seed-appointment',
    doctor: 'Dr. Maximiliano Prinzi',
    date: '10 June 2026',
    service: 'General Practitioner (GP)',
  },
];

/** Returns a new list containing the planned appointments. */
export const getAppointments = () => [...appointments];

// An omitted or stale route ID falls back to the first available appointment.
/** Finds an appointment by ID, falling back to the first available appointment. */
export const getAppointment = (id?: string) =>
  appointments.find((item) => item.id === id) ?? appointments[0];

/** Adds a planned appointment to the in-memory list. */
export const addAppointment = (appointment: Omit<PlannedAppointment, 'id'>) => {
  // Time-based IDs are sufficient for appointments created one at a time in this prototype.
  appointments = [...appointments, { ...appointment, id: `appointment-${Date.now()}` }];
};

/** Stores a copy of the signature strokes for one appointment. */
export const saveAppointmentSignature = (id: string, signaturePaths: string[]) => {
  // Copy the paths because the signature pad continues to own its working array.
  appointments = appointments.map((item) =>
    item.id === id ? { ...item, signaturePaths: [...signaturePaths] } : item,
  );
};

/** Clears the appointments held in memory. */
export function resetAppointments() {
  // Account deletion must also remove appointment data held only in memory.
  appointments = [];
}

registerAccountCleanup('care-planner.appointments', resetAppointments);
