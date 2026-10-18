import { styles } from '@/components/my-health/prescription-list-styles';
import { Shell } from '@/components/forms/form';
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
          <Text style={styles.copy}>Your prescriptions could not be loaded.</Text>
          <ActionButton label="Retry" onPress={reload} />
        </>
      ) : !list.length ? (
        <Text style={styles.copy}>No prescriptions added yet.</Text>
      ) : null}
      <View style={styles.list}>
        {list.map((item) => {
          const m = medicationLabel(item);
          return (
            <View key={item.id} style={styles.med}>
              <Text style={styles.medText}>{m}</Text>
              <View style={styles.medActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${m}`}
                  style={styles.iconButton}
                  onPress={() => {
                    router.push({ pathname: '/(tabs)/(myhealth)/(prescriptions)/edit', params: { id: item.id } });
                  }}
                >
                  <Feather name="edit-2" size={21} color={palette.success} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${m}`}
                  style={styles.iconButton}
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
          router.push('./edit');
        }}
      />
    </Shell>
  );
}
