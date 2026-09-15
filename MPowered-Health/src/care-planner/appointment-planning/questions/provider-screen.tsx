import { Field } from '@/shared/forms/Field';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { ActionButton } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { s as fieldStyles } from '../form-styles';
import { AppointmentDateField } from './date-screen';
import { usePlanningNavigation } from '../usePlanningNavigation';
import { appointmentDetailsReady } from '../appointment-draft/draft';
import { useAppointmentDraft } from '../appointment-draft/DraftProvider';
const practitioners = [
  'General Practitioner',
  'Physiotherapist',
  'Rheumatologist',
  'Osteopath',
  'Pain Medicine Specialist',
  'Orthopaedic surgeon',
  'Occupational Therapist',
];

/** Displays the provider fields and date control for the first appointment-planning step. */
export default function AppointmentProviderScreen() {
  const navigation = usePlanningNavigation();
  const { draft, dispatch } = useAppointmentDraft();
  const ready = appointmentDetailsReady(draft);
  return (
    <Shell title="Plan My Appointment" onBack={() => router.replace('/care')}>
      <Text style={s.flowEyebrow}>CARE PLANNER · 1/3</Text>
      <Text style={s.copy}>
        This helps you prepare; it does not create a real appointment with your healthcare provider.
      </Text>
      <AppointmentDateField />
      <Field
        label="Doctor’s name"
        value={draft.doctor}
        set={(value) => dispatch({ type: 'field', field: 'doctor', value })}
      />
      <HealthServiceSelect
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

/** Displays a menu of health services and reports the selected option. */
function HealthServiceSelect({
  title,
  options,
  value,
  pick,
}: {
  title: string;
  options: string[];
  value: string[];
  pick: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={fieldStyles.selectWrap}>
      <Text style={fieldStyles.selectLabel}>{title}</Text>
      <Text style={fieldStyles.optional}>optional</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={[fieldStyles.selectField, open && fieldStyles.selectFieldOpen]}
      >
        <Text style={[fieldStyles.selectValue, !value[0] && fieldStyles.datePlaceholder]}>
          {value[0] || 'Select healthcare practitioner service'}
        </Text>
        <Text style={fieldStyles.selectChevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <View style={fieldStyles.selectMenu}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                pick(option);
                setOpen(false);
              }}
              style={[fieldStyles.selectOption, value[0] === option && fieldStyles.selectOptionOn]}
            >
              <Text
                style={[
                  fieldStyles.selectOptionText,
                  value[0] === option && fieldStyles.selectOptionTextOn,
                ]}
              >
                {option}
              </Text>
              {value[0] === option ? <Text style={fieldStyles.selectTick}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
