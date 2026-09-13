import { Field } from '@/shared/forms/Field';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { useReturnDestination } from '@/shared/navigation/useReturnDestination';
import { ActionButton } from '@/shared/ui/mha-ui';
import { Text, View } from 'react-native';
import { useReflection } from '../hooks/useReflection';
export default function ReflectionScreen() {
  const leave = useReturnDestination('/dashboard');
  const form = useReflection(leave);
  return (
    <Shell title="My Reflection This week" onBack={leave}>
      <Text style={s.flowEyebrow}>REFLECTION · 1/1</Text>
      <Text style={s.copy}>
        Write down any reflections on your pain experience and management this week. Week beginning{' '}
        {form.week}. Your saved notes can be viewed and edited here.
      </Text>
      {form.loading ? <Text style={s.copy}>Loading reflection…</Text> : null}
      {form.error ? <Text style={s.fieldError}>{form.error}</Text> : null}
      <Field
        label="Notes"
        multiline
        value={form.notes}
        set={form.setNotes}
        editable={!form.loading && !form.saving && !form.error}
      />
      <View style={s.footer}>
        <ActionButton
          label={form.saving ? 'Saving…' : 'Save'}
          disabled={!form.notes.trim() || form.loading || form.saving || !!form.error}
          onPress={form.save}
        />
        {!form.notes.trim() ? (
          <Text style={s.required}>Complete the required information to continue.</Text>
        ) : null}
      </View>
    </Shell>
  );
}
