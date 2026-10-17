import { Field } from '@/components/forms/field';
import { Shell } from '@/components/forms/form-screen';
import { SelectField } from '@/components/forms/select-field';
import { ActionButton } from '@/components/my-health/app-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedicationEditor } from '@/hooks/use-prescription-editor';

/** Displays the fields for adding or editing a prescription. */
export default function PrescriptionEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Editor key={id ?? 'new'} id={id} />;
}

/** Displays the prescription fields and save controls using the editor’s current values. */
function Editor({ id }: { id?: string }) {
  const { draft, change, validName, validStrength, duplicate, ready, save, missing, } = useMedicationEditor(id);
  const { name, strength, unit, form, repeat } = draft;
  if (missing)
    return (
      <Shell title="My Prescriptions">
        <Text>This prescription is no longer available.</Text>
        <ActionButton
          label="Back to prescriptions"
          onPress={() => router.replace('/(tabs)/myhealth/prescriptions')}
        />
      </Shell>
    );
  return (
    <Shell
      title={!id ? 'Add prescription' : 'Edit prescription'}
      onBack={() => router.back()}
    >
      <Field
        label="Medication name"
        value={name}
        set={(value) => change('name', value)}
        error={!validName ? 'Medication name is required.' : duplicate ? 'You have already added a prescription with this name, strength and unit.' : undefined}
      />
      <Field
        label="Strength"
        value={strength}
        set={(value) => change('strength', value)}
        input="decimal"
        error={!validStrength ? 'Enter a strength greater than zero.' : undefined}
      />
      <SelectField
        label="Strength unit"
        options={['mg', 'g', '%', 'μg', 'iu']}
        value={unit}
        onChange={(value) => change('unit', value)}
      />
      <SelectField
        label="Form"
        options={['Tablet', 'Capsule', 'Liquid', 'Drops', 'Injections', 'Spray', 'mL', 'Patches']}
        value={form}
        onChange={(value) => change('form', value)}
      />
      <SelectField
        label="Repeat every"
        options={['hour', 'day', 'week', 'month']}
        value={repeat}
        onChange={(value) => change('repeat', value)}
      />
      <ActionButton
        label="Save prescription"
        disabled={!ready}
        onPress={async () => {
          if (!(await save())) return;
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/myhealth/prescriptions');
        }}
      />
    </Shell>
  );
}
