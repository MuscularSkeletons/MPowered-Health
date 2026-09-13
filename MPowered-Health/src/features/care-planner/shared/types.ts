export type AppointmentQuestion = { group: string; text: string };
export type PlannedAppointment = {
  id: string;
  doctor: string;
  date: string;
  service: string;
  questions?: AppointmentQuestion[];
  signaturePaths?: string[];
};
