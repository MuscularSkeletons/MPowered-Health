import { s } from '../questions/styles';
import { palette } from '@/shared/ui/mha-ui';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { createElement, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
export function AppointmentDateField({
  value,
  set,
}: {
  value: string;
  set: (value: string) => void;
}) {
  const label = 'Appointment date';
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftDate, setDraftDate] = useState(new Date());
  // The app displays DD/MM/YYYY; the browser's date control requires YYYY-MM-DD.
  const toIsoDate = (displayDate: string) => {
    const [day, month, year] = displayDate.split('/');
    return year && month && day ? `${year}-${month}-${day}` : '';
  };
  const fromIsoDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-');
    return year && month && day ? `${day}/${month}/${year}` : '';
  };
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (Platform.OS === 'web')
    return (
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{label}</Text>
        <View style={s.dateField}>
          {createElement('input', {
            type: 'date',
            'aria-label': 'Select appointment date',
            value: toIsoDate(value),
            min: todayIso,
            onChange: (event: { target: { value: string } }) =>
              set(fromIsoDate(event.target.value)),
            style: {
              flex: 1,
              height: 54,
              border: 0,
              outline: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              color: palette.text,
            },
          })}
        </View>
      </View>
    );
  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date)
        set(
          date.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        );
    } else if (date) setDraftDate(date);
  };
  const selectedDate = value ? new Date(value.split('/').reverse().join('-')) : new Date();
  const openPicker = () => {
    setDraftDate(selectedDate);
    setShowDatePicker(true);
  };
  const saveDate = () => {
    set(
      draftDate.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    );
    setShowDatePicker(false);
  };
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select appointment date"
        onPress={openPicker}
        style={s.dateField}
      >
        <Text style={[s.dateFieldText, !value && s.datePlaceholder]}>
          {value || 'Select appointment date'}
        </Text>
        <Image
          pointerEvents="none"
          source={require('@/assets/icons/iconify-calendar.svg')}
          style={s.calendarIcon}
          contentFit="contain"
        />
      </Pressable>
      {showDatePicker && Platform.OS === 'ios' ? (
        <Modal
          transparent
          presentationStyle="overFullScreen"
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={s.dateModalBackdrop}>
            <View style={s.dateModal}>
              <Text style={s.dateModalTitle}>Select appointment date</Text>
              <DateTimePicker
                value={draftDate}
                mode="date"
                minimumDate={new Date()}
                display="inline"
                accentColor={palette.primary}
                themeVariant="light"
                onChange={onDateChange}
              />
              <View style={s.dateModalActions}>
                <Pressable onPress={() => setShowDatePicker(false)} style={s.dateModalButton}>
                  <Text style={s.dateModalCancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveDate} style={[s.dateModalButton, s.dateModalDone]}>
                  <Text style={s.dateModalDoneText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : showDatePicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          minimumDate={new Date()}
          display="default"
          onChange={onDateChange}
        />
      ) : null}
    </View>
  );
}
