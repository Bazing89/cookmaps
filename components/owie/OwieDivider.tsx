import { View } from 'react-native';
import { owie } from '../../theme/owieTheme';

export function OwieDivider() {
  return (
    <View style={{ height: 1, backgroundColor: owie.tdBorder, marginVertical: 10, width: '100%' }} />
  );
}
