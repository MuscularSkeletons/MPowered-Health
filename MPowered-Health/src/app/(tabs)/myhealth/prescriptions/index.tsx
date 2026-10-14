import { prescriptionListStyles as s } from '@/components/my-health/prescription-list-styles';
import { Shell } from '@/components/forms/form-screen';
import { ActionButton } from '@/components/my-health/app-ui';
import { palette } from '@/constants/profile/ui';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { medicationLabel } from '@/types/prescription';
import { useMedications } from '@/context/prescriptions-context';

/** Lists prescriptions and provides controls for adding or editing them. */
export default function PrescriptionsScreen() {
  const { list, remove, loadFailed, reload } = useMedications();
  return (
    <Shell title="My prescriptions" onBack={() => router.back()}>
      {loadFailed ? (
        <>
          <Text style={s.copy}>Your prescriptions could not be loaded.</Text>
          <ActionButton label="Retry" onPress={reload} />
        </>
      ) : !list.length ? (
        <Text style={s.copy}>No prescriptions added yet.</Text>
      ) : null}
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
                    router.push({ pathname: '/(tabs)/myhealth/prescriptions/edit', params: { id: item.id } });
                  }}
                >
                  <Feather name="edit-2" size={21} color={palette.success} />
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
        disabled={loadFailed}
        onPress={() => {
          router.push('/(tabs)/myhealth/prescriptions/edit');
        }}
      />
    </Shell>
  );
}
