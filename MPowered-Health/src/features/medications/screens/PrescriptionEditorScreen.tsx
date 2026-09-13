import { Choice } from '@/shared/forms/Choice';
import { Field } from '@/shared/forms/Field';
import { Shell } from '@/shared/forms/FormScreen';
import { ActionButton } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedicationEditor } from '../hooks/useMedicationEditor';
export default function PrescriptionEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Editor key={id ?? 'new'} id={id} />;
}
function Editor({ id }: { id?: string }) {
  const { draft, change, validName, validStrength, ready, save, missing } = useMedicationEditor(id);
  const { name, strength, unit, form, repeat } = draft;
  if (missing)
    return (
      <Shell title="My Prescriptions">
        <Text>This prescription is no longer available.</Text>
        <ActionButton
          label="Back to prescriptions"
          onPress={() => router.replace('/prescriptions')}
        />
      </Shell>
    );
  return (
    <Shell
      title={!id ? 'Add prescription' : 'Edit prescription'}
      onBack={() => {
        router.back();
      }}
    >
      <Field
        label="Medication name"
        value={name}
        set={(value) => change('name', value)}
        error={!validName ? 'Medication name is required.' : undefined}
      />
      <Field
        label="Strength"
        value={strength}
        set={(value) => change('strength', value)}
        input="decimal"
        error={!validStrength ? 'Enter a strength greater than zero.' : undefined}
      />
      <Choice
        title="Strength unit"
        options={['mg', 'g', '%', 'μg', 'iu']}
        value={[unit]}
        pick={(v) => change('unit', v)}
      />
      <Choice
        title="Form"
        options={['Tablet', 'Capsule', 'Liquid', 'Drops', 'Injections', 'Spray', 'mL', 'Patches']}
        value={[form]}
        pick={(v) => change('form', v)}
      />
      <Choice
        title="Repeat every"
        options={['hour', 'day', 'week', 'month']}
        value={[repeat]}
        pick={(v) => change('repeat', v)}
      />
      <ActionButton
        label="Save prescription"
        disabled={!ready}
        onPress={() => {
          if (!save()) return;
          if (router.canGoBack()) router.back();
          else router.replace('/prescriptions');
        }}
      />
    </Shell>
  );
}
