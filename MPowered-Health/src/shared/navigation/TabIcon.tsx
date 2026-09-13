import { View } from 'react-native';
import { NavGlyph, type NavIconName } from './NavGlyph';
import { s } from './tab-styles';
export function NavIcon({
  focused,
  color,
  name,
}: {
  focused: boolean;
  color: string;
  name: NavIconName;
}) {
  return (
    <View style={[s.iconPill, focused && s.iconPillActive]}>
      <NavGlyph name={name} color={color} filled={focused} />
    </View>
  );
}
