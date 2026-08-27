import { Image } from 'expo-image';

export type NavIconName = 'accessibility' | 'folder' | 'clipboard' | 'settings';

const icons = {
  accessibility: require('../../assets/icons/iconify-human.svg'),
  folder: require('../../assets/icons/iconify-folder.svg'),
  clipboard: require('../../assets/icons/iconify-clipboard.svg'),
  settings: require('../../assets/icons/iconify-cog.svg'),
};
const outlineIcons = {
  accessibility: require('../../assets/icons/iconify-human.svg'),
  folder: require('../../assets/icons/iconify-folder-outline.svg'),
  clipboard: require('../../assets/icons/iconify-clipboard-outline.svg'),
  settings: require('../../assets/icons/iconify-cog-outline.svg'),
};

export function NavGlyph({
  name,
  color,
  filled = false,
}: {
  name: NavIconName;
  color: string;
  filled?: boolean;
}) {
  return (
    <Image
      source={(filled ? icons : outlineIcons)[name]}
      style={{ width: 26, height: 26, tintColor: color }}
      contentFit="contain"
    />
  );
}
