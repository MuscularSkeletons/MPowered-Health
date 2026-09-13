import { CompactSelect } from '@/features/appointments/components/PractitionerSelect';
import { appointment } from '@/features/appointments/models/appointment';
import { Field } from '@/shared/forms/Field';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { ActionButton } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { AppointmentDateField } from '../components/AppointmentDateField';
import { useAppointmentNavigation } from '../hooks/useAppointmentNavigation';
import { appointmentDetailsReady } from '../models/appointment-draft';
import { useAppointmentDraft } from '../state/AppointmentDraftProvider';
export default function AppointmentDetailsScreen() {
  const navigation = useAppointmentNavigation();
  const { draft, dispatch } = useAppointmentDraft();
  const question = appointment.steps[0];
  const ready = appointmentDetailsReady(draft);
  return (
    <Shell title={question.title} onBack={() => router.replace('/care')}>
      <Text style={s.flowEyebrow}>CARE PLANNER · 1/3</Text>
      <Text style={s.copy}>{question.copy}</Text>
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
        options={question.options!}
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
