import { s } from '@/care-planner/shared/review-styles';
// This screen lets the user review and update a planned healthcare appointment.
import { saveAppointmentSignature } from '@/care-planner/appointments/repository';
import { ActionButton } from '@/shared/ui/mha-ui';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PlannedAppointment } from '@/care-planner/appointments/types';
import { SignaturePad } from './SignaturePad';
export function RecordingConsentModal({
  open,
  appointment,
  onClose,
  onSaved,
}: {
  open: boolean;
  appointment: PlannedAppointment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [signaturePaths, setSignaturePaths] = useState(appointment.signaturePaths ?? []);
  const save = () => {
    if (!signaturePaths.length) return;
    saveAppointmentSignature(appointment.id, signaturePaths);
    onSaved();
    onClose();
  };
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.consentScreen} edges={['top', 'bottom']}>
        <Pressable
          onPress={onClose}
          style={[s.consentBack, { paddingTop: Math.max(insets.top, 20) }]}
        >
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <View style={s.consentContent}>
          <View style={s.consentHeading}>
            <Text style={s.consentEyebrow}>CARE PLANNER</Text>
            <Text style={s.consentTitle}>Ask for Recording Consent</Text>
          </View>
          <View style={s.consentCard}>
            <Text style={s.fieldLabel}>Appointment date</Text>
            <View style={s.readonly}>
              <Text>{appointment.date}</Text>
            </View>
            <Text style={s.fieldLabel}>Doctor’s name</Text>
            <View style={s.readonly}>
              <Text>{appointment.doctor}</Text>
            </View>
            <Text style={s.fieldLabel}>Health services</Text>
            <View style={s.readonly}>
              <Text>{appointment.service}</Text>
            </View>
            <Text style={s.fieldLabel}>Doctor’s signature</Text>
            <SignaturePad paths={signaturePaths} setPaths={setSignaturePaths} />
            <Text style={s.legal}>
              By providing this signature, the healthcare practitioner agrees that the patient may
              record today’s consultation.
            </Text>
          </View>
        </View>
        <View style={s.consentFooter}>
          <ActionButton label="Save consent" disabled={!signaturePaths.length} onPress={save} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
