import { s } from '../styles/CareScreen';
// This screen shows care-planning tools, appointments, and questions for clinicians.
import { getAppointments } from '@/features/appointments/services/appointments';
import { ActionButton, MhaHeader, PageIntro } from '@/shared/ui/mha-ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { content } from '../models/content';
// Every care card opens the shared workflow with a fresh form state.
const go = (flow: string) =>
  router.push({
    pathname: flow === 'appointment' ? '/appointment/details' : '/tips',
    params: {
      fresh: String(Date.now()),
      flow,
      returnTo: '/care',
    },
  });
// Refresh appointments on focus and open each care-planning tool.
export default function Care() {
  const [appointments, setAppointments] = useState(getAppointments());
  useFocusEffect(useCallback(() => setAppointments(getAppointments()), []));
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <PageIntro eyebrow="CARE PLANNER" title={content.title} description={content.description} />
        <Text style={s.sectionTitle}>Appointment preparation</Text>
        <View style={s.cards}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Explore self-management tips for my ongoing pain</Text>
            <ActionButton label="Explore tips" onPress={() => go('tips')} />
          </View>
        </View>
        <View style={s.appointments}>
          <Text style={s.heading}>{content.appointmentsTitle}</Text>
          {appointments.map((appointment) => (
            <View key={appointment.id} style={s.empty}>
              <Text style={s.doctor}>{appointment.doctor}</Text>
              <Text style={s.date}>Date: {appointment.date}</Text>
              <ActionButton
                label="View"
                onPress={() =>
                  router.push({
                    pathname: '/appointment-review',
                    params: { id: appointment.id },
                  })
                }
              />
            </View>
          ))}
          <View style={s.empty}>
            <Text style={s.emptyText}>
              Plan another appointment with a healthcare practitioner.
            </Text>
            <ActionButton
              label="Plan"
              onPress={() =>
                router.push({
                  pathname: '/appointment/details',
                  params: {
                    fresh: String(Date.now()),
                    flow: 'appointment',
                    step: '0',
                  },
                })
              }
            />
          </View>
        </View>
        <Text style={s.sponsor}>Supported by ABBVIE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
// Keep care cards and appointment list styles below the screen behavior.
