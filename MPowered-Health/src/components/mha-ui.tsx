import { Pressable, StyleSheet, Text, View } from 'react-native';
export const palette = {
  primary: '#5E17EB',
  secondary: '#8C52FF',
  accent: '#BEA1F7',
  light: '#D8C7FA',
  primaryDark: '#4610B8',
  text: '#201A2B',
  muted: '#686173',
  background: '#F9F8FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F4FC',
  line: '#E5DFF0',
  success: '#257A57',
  error: '#A64259',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const layout = {
  screenGutter: 24,
  screenTop: 24,
  screenBottom: 112,
  maxContentWidth: 680,
  sectionGap: 32,
  cardPadding: 18,
  controlHeight: 56,
};
export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 };
export function MhaHeader() {
  return (
    <View style={s.header}>
      <View style={s.logoLockup}>
        <View style={s.poweredMark}>
          <Text style={s.centerM}>M</Text>
          <Text style={s.centerPowered}>Powered</Text>
        </View>
        <Text style={s.centerHealth}>Health</Text>
      </View>
    </View>
  );
}
export function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.action, disabled && s.disabled, pressed && s.pressed]}
    >
      <Text style={[s.actionText, disabled && s.disabledText]}>{label}</Text>
    </Pressable>
  );
}
export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={s.section}>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <View>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
      <Text style={s.pageTitle}>{title}</Text>
      <Text style={s.description}>{description}</Text>
    </View>
  );
}
const tones = {
  rose: ['#F8E1E5', '#94465A'],
  mint: ['#DFF1E9', '#27705A'],
  blue: ['#E1EBF7', '#3C648E'],
  gold: ['#F5EBD2', '#83651F'],
  violet: ['#E9DEFF', '#5E17EB'],
} as const;
export function HealthCard({
  tone,
  symbol,
  title,
  description,
  meta,
  onPress,
}: {
  tone: keyof typeof tones;
  symbol: string;
  title: string;
  description: string;
  meta: string;
  onPress: () => void;
}) {
  let [c, fg] = tones[tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        pressed && {
          transform: [
            {
              scale: 0.98,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          s.icon,
          {
            backgroundColor: c,
          },
        ]}
      >
        <Text
          style={{
            color: fg,
            fontSize: 19,
          }}
        >
          {symbol}
        </Text>
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardDescription}>{description}</Text>
      <Text style={s.meta}>{meta}</Text>
      <Text style={s.chevron}>›</Text>
    </Pressable>
  );
}
export function SummaryRow({
  tone,
  symbol,
  title,
  description,
  meta,
  onPress,
}: {
  tone: keyof typeof tones;
  symbol: string;
  title: string;
  description: string;
  meta: string;
  onPress: () => void;
}) {
  let [c, fg] = tones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
    >
      <View
        style={[
          s.rowIcon,
          {
            backgroundColor: c,
          },
        ]}
      >
        <Text
          style={{
            color: fg,
            fontSize: 18,
          }}
        >
          {symbol}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={s.rowTitle}>{title}</Text>
        {description ? <Text style={s.rowDescription}>{description}</Text> : null}
      </View>
      <Text style={s.rowMeta}>{meta}</Text>
      <Text style={s.rowChevron}>›</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: '#E9E4F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#2F174A',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  logoLockup: { height: 34, flexDirection: 'row', alignItems: 'flex-end' },
  poweredMark: { width: 78, height: 34, position: 'relative' },
  centerM: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '800',
    color: '#18151C',
  },
  centerPowered: {
    position: 'absolute',
    left: 25,
    top: 0,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
    color: '#18151C',
  },
  centerHealth: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: '#8C52FF',
    marginLeft: 12,
  },
  action: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#5E17EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#4610B8',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#4610B8',
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
  disabled: { backgroundColor: '#D8C7FA', shadowOpacity: 0, elevation: 0 },
  disabledText: { color: '#5E17EB' },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#5E17EB',
    marginBottom: 7,
  },
  section: {
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#201A2B',
  },
  pageTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.55,
    color: '#201A2B',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#686173',
    marginTop: 6,
  },
  card: {
    width: '48.3%',
    minHeight: 164,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderWidth: 1,
    borderColor: '#E9E4F0',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#201A2B',
    paddingRight: 18,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#686173',
    marginTop: 5,
  },
  meta: {
    fontSize: 11,
    color: '#5E17EB',
    fontWeight: '700',
    marginTop: 'auto',
  },
  chevron: {
    position: 'absolute',
    right: 14,
    top: 16,
    fontSize: 22,
    color: '#8B8296',
  },
  row: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#E9E4F0',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPressed: {
    backgroundColor: '#F3EEFF',
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  rowTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#201A2B',
  },
  rowDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#686173',
    marginTop: 3,
  },
  rowMeta: {
    fontSize: 10,
    color: '#5E17EB',
    fontWeight: '700',
    marginLeft: 8,
  },
  rowChevron: {
    fontSize: 20,
    color: '#92899D',
    marginLeft: 5,
  },
});
