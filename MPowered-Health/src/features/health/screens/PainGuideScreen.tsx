import { tips } from '@/features/health/models/tips';
import { Choice } from '@/shared/forms/Choice';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { useReturnDestination } from '@/shared/navigation/useReturnDestination';
import { ActionButton } from '@/shared/ui/mha-ui';
import { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
const urls: Record<string, string> = {
  'Understanding pain': 'https://muscha.org/pain-guide/',
  'Exercise and movement': 'https://muscha.org/exercise',
  'Living well with a musculoskeletal condition':
    'https://muscha.org/living-well-with-a-musculoskeletal-condition',
  'Relaxation and emotions': 'https://muscha.org/relaxation/',
};
export default function PainGuideScreen() {
  const leave = useReturnDestination('/care');
  const [selected, setSelected] = useState<string[]>([]);
  const question = tips.steps[0];
  const open = async () => {
    if (!selected[0]) return;
    try {
      await Linking.openURL(urls[selected[0]]);
    } catch {
      Alert.alert('Unable to open pain guide', 'Please try again.');
    }
  };
  return (
    <Shell title={question.title} onBack={leave}>
      <Text style={s.flowEyebrow}>PAIN GUIDE · 1/1</Text>
      <Text style={s.copy}>{question.copy}</Text>
      <Choice options={question.options!} value={selected} pick={(value) => setSelected([value])} />
      <View style={s.footer}>
        <ActionButton label="Open pain guide" disabled={!selected.length} onPress={open} />
        {!selected.length ? (
          <Text style={s.required}>Complete the required information to continue.</Text>
        ) : null}
      </View>
    </Shell>
  );
}
