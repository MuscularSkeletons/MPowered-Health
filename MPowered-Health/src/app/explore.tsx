import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, PageIntro, SectionHeading, SummaryRow, palette } from '@/components/mha-ui';
const go = (flow: string) => router.push({
    pathname: '/workflow',
    params: {
      flow
    }
  }),
  values = [38, 56, 46, 72, 58, 44, 51];
export default function Health() {
  return <SafeAreaView style={s.safe} edges={['top']}><MhaHeader /><ScrollView contentContainerStyle={s.content}><PageIntro eyebrow="MY HEALTH" title="My Health" description="New insights for your MPowered plan." /><View style={s.metric}><Text style={s.label}>Your average pain increased</Text><Text style={s.value}>7<Text style={s.unit}>/10</Text></Text><View style={s.chart}>{values.map((v, i) => <View key={i} style={[s.bar, {
            height: `${v}%`
          }, i === 6 && s.today]} />)}</View><View style={s.days}>{['25/05', '', '', '01/06', '', '', '08/06'].map((d, i) => <Text key={i} style={s.day}>{d}</Text>)}</View><Text onPress={() => go('records')} style={s.link}>Check pain history  →</Text></View><SectionHeading eyebrow="MY HEALTH" title="Health information" /><View style={{
        gap: 12
      }}><SummaryRow tone="gold" symbol="◉" title="My MPowered Health Profile" description="Updated by 18 Feb 2026" meta="Open" onPress={() => go('profile')} /><SummaryRow tone="rose" symbol="♥" title="Check Pain Guide" description="" meta="Open" onPress={() => go('tips')} /><SummaryRow tone="violet" symbol="□" title="Plan an appointment with a doctor" description="" meta="Open" onPress={() => router.push('/care')} /><SummaryRow tone="mint" symbol="↗" title="Check my health tracking records" description="" meta="Open" onPress={() => go('records')} /><SummaryRow tone="blue" symbol="＋" title="Check my prescriptions" description="" meta="Open" onPress={() => go('prescriptions')} /><SummaryRow tone="violet" symbol="⚙" title="Settings and privacy" description="Support access, permissions and health data" meta="Open" onPress={() => go('settings')} /></View></ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:24,paddingTop:24,paddingBottom:112
  },
  metric: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 24,
    padding: 20,
    marginTop: 28,
    shadowColor: '#2F174A',
    shadowOpacity: .06,
    shadowRadius: 14
  },
  label: {
    fontSize: 12,
    color: palette.muted
  },
  value: {
    fontSize: 38,
    fontWeight: '800',
    color: palette.text,
    marginTop: 2
  },
  unit: {
    fontSize: 13,
    color: palette.muted
  },
  chart: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 11,
    borderBottomWidth: 1,
    borderColor: '#E5DFF0',
    paddingTop: 16
  },
  bar: {
    flex: 1,
    backgroundColor: '#BEA1F7',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  today: {
    backgroundColor: palette.primary
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8
  },
  day: {
    fontSize: 9,
    color: '#7B7385'
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    textAlign: 'right',
    marginTop: 18,
    paddingVertical: 6
  }
});
