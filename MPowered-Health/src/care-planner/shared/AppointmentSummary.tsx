import { Text, View } from 'react-native';
import type { PlannedAppointment } from '@/care-planner/appointments/types';
import { s } from './styles';

/** Displays the appointment date, doctor, and health service. */
export function AppointmentSummary({
  appointment,
}: {
  appointment: Pick<PlannedAppointment, 'date' | 'doctor' | 'service'>;
}) {
  return (
    <>
      <Text style={s.cardTitle}>Appointment overview</Text>
      <View style={s.overview}>
        <Text style={s.metaLabel}>Appointment date</Text>
        <Text style={s.metaValue}>{appointment.date}</Text>
        <Text style={s.metaLabel}>Doctor’s name</Text>
        <Text style={s.metaValue}>{appointment.doctor}</Text>
        <Text style={s.metaLabel}>Health services</Text>
        <Text style={s.metaValue}>{appointment.service}</Text>
      </View>
    </>
  );
}
