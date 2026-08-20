import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, PageIntro, palette } from '@/components/mha-ui';
import { productContent } from '@/constants/product-content';
import { getAppointments } from '@/constants/appointments';
const go = (flow: string) => router.push({
  pathname: '/workflow',
  params: {
    flow
  }
});
export default function Care() {
  const [appointments,setAppointments]=useState(getAppointments());
  useFocusEffect(useCallback(()=>setAppointments(getAppointments()),[]));
  return <SafeAreaView style={s.safe} edges={['top']}><MhaHeader /><ScrollView contentContainerStyle={s.content}><PageIntro eyebrow="CARE PLANNER" title={productContent.care.title} description={productContent.care.description} /><Text style={s.sectionTitle}>Appointment preparation</Text><View style={s.cards}><View style={s.card}><Text style={s.cardTitle}>Explore self-management tips for my ongoing pain</Text><ActionButton label="Explore tips" onPress={() => go('tips')} /></View></View><View style={s.appointments}><Text style={s.heading}>{productContent.care.appointmentsTitle}</Text>{appointments.map(appointment=><View key={appointment.id} style={s.empty}><Text style={s.doctor}>{appointment.doctor}</Text><Text style={s.date}>Date: {appointment.date}</Text><ActionButton label="View" onPress={() => router.push({pathname:'/appointment-review',params:{id:appointment.id}})} /></View>)}<View style={s.empty}><Text style={s.emptyText}>Plan another appointment with a healthcare practitioner.</Text><ActionButton label="Plan" onPress={() => router.push({pathname:'/workflow',params:{flow:'appointment',step:'0',fresh:String(Date.now())}})} /></View></View><Text style={s.sponsor}>Supported by ABBVIE</Text></ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:24,paddingTop:24,paddingBottom:112
  },
  cards: {
    gap: 16
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
    marginTop: 32,
    marginBottom: 14
  },
  card: {
    backgroundColor: '#F7F4FC',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 20
  },
  appointments: {
    backgroundColor: '#F4F2F7',
    borderRadius: 22,
    padding: 20,
    marginTop: 32,
    gap: 16
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 2
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: palette.muted,
    marginBottom: 18
  },
  doctor: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text
  },
  date: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 4,
    marginBottom: 16
  },
  sponsor: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
    textAlign: 'center',
    marginTop: 28
  }
});
