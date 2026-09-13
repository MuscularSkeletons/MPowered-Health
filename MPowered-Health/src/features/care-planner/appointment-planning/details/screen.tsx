import { CompactSelect } from './PractitionerSelect';
import { Field } from '@/shared/forms/Field';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { ActionButton } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { AppointmentDateField } from './DateField';
import { useAppointmentNavigation } from '../usePlanNavigation';
import { appointmentDetailsReady } from '../state/draft';
import { useAppointmentDraft } from '../state/DraftProvider';
const practitioners = [
  'General Practitioner',
  'Physiotherapist',
  'Rheumatologist',
  'Osteopath',
  'Pain Medicine Specialist',
  'Orthopaedic surgeon',
  'Occupational Therapist',
];
export default function AppointmentDetailsScreen() {
  const navigation = useAppointmentNavigation();
  const { draft, dispatch } = useAppointmentDraft();
  const ready = appointmentDetailsReady(draft);
  return (
    <Shell title="Plan My Appointment" onBack={() => router.replace('/care')}>
      <Text style={s.flowEyebrow}>CARE PLANNER · 1/3</Text>
      <Text style={s.copy}>
        This helps you prepare; it does not create a real appointment with your healthcare provider.
      </Text>
      <AppointmentDateField
        value={draft.date}
        set={(value) => dispatch({ type: 'field', field: 'date', value })}
      />
      <Field
        label="Doctor’s name"
        value={draft.doctor}
        set={(value) => dispatch({ type: 'field', field: 'doctor', value })}
      />
      <CompactSelect
        title="Health services"
        options={practitioners}
        value={draft.service ? [draft.service] : []}
        pick={(value) => dispatch({ type: 'field', field: 'service', value })}
      />
      <View style={s.footer}>
        <ActionButton label="Continue" disabled={!ready} onPress={navigation.questions} />
        {!ready ? (
          <Text style={s.required}>Complete the required information to continue.</Text>
        ) : null}
      </View>
    </Shell>
  );
}
