import { 
  Text, 
  View, 
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { palette } from "@/constants/ui/styling";

/** Specifies the buttons for modals */
export function ModalActions({
  isSaving,
  onCancel,
  onSave,
}: {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.buttonOptions}>
      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={onCancel}
        style={({ pressed }) => [
          styles.button,
          styles.buttonCancel,
          pressed && !isSaving && styles.buttonPressed,
          isSaving && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonCancelText}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSaving, disabled: isSaving }}
        disabled={isSaving}
        onPress={onSave}
        style={({ pressed }) => [
          styles.button,
          styles.buttonSave,
          pressed && !isSaving && styles.buttonPressed,
          isSaving && styles.buttonSaving,
        ]}
      >
        {isSaving ? (
          <View style={styles.savingContent}>
            <ActivityIndicator size="small" color={palette.text} />
            <Text style={styles.buttonSaveText}>Saving…</Text>
          </View>
        ) : (
          <Text style={styles.buttonSaveText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
    buttonOptions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        paddingTop: 22,
    },
    button: {
        minWidth: 96,
        minHeight: 46,
        borderRadius: 23,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.line,
    },
    buttonSave: {
        backgroundColor: palette.primary,
        flex: 1,
        maxWidth: 220,
        shadowColor: palette.primaryDark,
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
    buttonDisabled: { opacity: 0.45 },
    buttonSaving: { backgroundColor: palette.disabledBackground, shadowOpacity: 0, elevation: 0 },
    savingContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    buttonCancelText: { color: palette.text, fontWeight: '800' },
    buttonSaveText: { color: palette.text, fontWeight: '800' },
});

export const modalStyles = StyleSheet.create({
    centredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(58,48,53,0.48)',
    },
    editInterface: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '88%',
        backgroundColor: palette.surface,
        padding: 22,
        borderWidth: 1,
        borderColor: palette.line,
        shadowColor: palette.text,
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 8,
        borderRadius: 24,
    },
    modalTitle: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: palette.text, marginBottom: 8 },
    modalDescription: { fontSize: 13, lineHeight: 20, color: palette.muted, marginBottom: 8 },
});