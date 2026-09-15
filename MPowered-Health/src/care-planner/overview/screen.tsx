import { s } from './styles';
import { getAppointments } from '@/care-planner/appointments/repository';
import { ActionButton, MhaHeader, PageIntro } from '@/shared/ui/mha-ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Opens the selected Care Planner destination.
 *
 * Every care card opens the shared workflow with a fresh form state.
 */
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
const content = {
  title: 'Plan your visit with confidence',
  description:
    'Get ready for your visit. Prepare questions and keep notes during your appointments.',
  questionsAction: 'Explore questions generated for me',
  prepareAction: 'Prepare for my appointment',
  appointmentsTitle: 'My Appointments:',
  doctor: 'Dr. Maximiliano Prinzi',
  date: 'Date: 10 June 2026',
} as const;

/** Lists planned appointments and provides the entry point for a new plan. */
export default function CarePlannerScreen() {
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
