import { Field, PrescriptionScreen, SelectField } from '@/components/prescription/form';
import { SecondaryButton } from '@/components/shared/common';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { usePrescriptionEditor } from '@/context/prescriptionsContext';

/** Displays the fields for adding or editing a prescription */
export default function PrescriptionEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Editor key={id ?? 'new'} id={id} />;
}

/** Displays the prescription fields and save button */
function Editor({ id }: { id?: string }) {
  const { draft, change, validName, validStrength, duplicate, ready, save, missing, validRepeat } = usePrescriptionEditor(id);
  const { name, strength, unit, form, repeat, frequency } = draft;
  if (missing)
    return (
      <PrescriptionScreen title="Prescriptions List">
        <Text>This prescription is no longer available.</Text>
        <SecondaryButton
          label="Back to prescriptions"
          onPress={() => router.replace('/(tabs)/(myhealth)/(prescriptions)')}
        />
      </PrescriptionScreen>
    );
  return (
    <PrescriptionScreen
      title={!id ? 'Add Prescription' : 'Edit Prescription'}
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
      <Field
        label="Repeat every"
        value={repeat}
        set={(value) => change('repeat', value)}
        input="decimal"
        error={!validRepeat ? 'Enter a value greater than zero.' : undefined}
      />
      <SelectField
        label="Unit of time"
        options={['hour', 'day', 'week', 'month']}
        value={frequency}
        onChange={(value) => change('frequency', value)}
      />
      <SecondaryButton
        label="Save prescription"
        disabled={!ready}
        onPress={async () => {
          if (!(await save())) return;
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/(myhealth)/(prescriptions)');
        }}
      />
    </PrescriptionScreen>
  );
}
