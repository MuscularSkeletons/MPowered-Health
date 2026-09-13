import { s } from '@/features/medications/styles/prescriptions';
import { Shell } from '@/shared/forms/FormScreen';
import { ActionButton, palette } from '@/shared/ui/mha-ui';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { medicationLabel } from '../models/medication';
import { useMedications } from '../state/MedicationProvider';
export default function PrescriptionsScreen() {
  const { list, remove } = useMedications();
  return (
    <Shell title="My Prescriptions" onBack={() => router.replace('/explore')}>
      {!list.length ? <Text style={s.copy}>Prescription list is empty</Text> : null}
      <View style={s.list}>
        {list.map((item) => {
          const m = medicationLabel(item);
          return (
            <View key={item.id} style={s.med}>
              <Text style={s.medText}>{m}</Text>
              <View style={s.medActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${m}`}
                  style={s.iconButton}
                  onPress={() => {
                    router.push({ pathname: '/prescriptions/edit', params: { id: item.id } });
                  }}
                >
                  <Feather name="edit-2" size={21} color={palette.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${m}`}
                  style={s.iconButton}
                  onPress={() => remove(item.id)}
                >
                  <Feather name="trash-2" size={21} color={palette.error} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
      <ActionButton
        label="Add prescription"
        onPress={() => {
          router.push('/prescriptions/new');
        }}
      />
    </Shell>
  );
}
