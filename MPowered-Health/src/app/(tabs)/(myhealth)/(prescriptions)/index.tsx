import { Shell } from '@/components/prescription/form';
import { ActionButton } from '@/components/my-health/app-ui';
import { palette } from '@/constants/ui/styling';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { medicationLabel } from '@/types/prescription';
import { useMedications } from '@/context/prescriptions-context';

/** Lists prescriptions and provides controls for adding or editing them. */
export default function PrescriptionsScreen() {
  const { list, remove, loadFailed, reload } = useMedications();
  return (
    <Shell title="Prescriptions List" onBack={() => router.back()}>
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

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginBottom: 18,
  },
  med: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: palette.text,
  },
  copy: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
    marginTop: 10,
    marginBottom: 16,
  },
});
