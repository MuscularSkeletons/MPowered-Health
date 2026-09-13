import { s } from '../styles';
import { Linking, Pressable, Text, View } from 'react-native';
export function SummaryInsight({
  summary,
  tip,
  url,
}: {
  summary: string;
  tip: string;
  url: string;
}) {
  return (
    <View style={s.summaryInsight}>
      <View style={s.summaryStatement}>
        <Text style={s.summaryStatementText}>{summary}</Text>
      </View>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [s.guideButton, pressed && s.guidePressed]}
        onPress={() => Linking.openURL(url)}
      >
        <Text style={s.guideIcon}>⌕</Text>
        <Text style={s.guideText}>{tip}</Text>
        <Text style={s.guideArrow}>›</Text>
      </Pressable>
    </View>
  );
}
