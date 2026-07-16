import { Text, View } from 'react-native';
import type { ClaimedPlate } from '../../screens/cook/types';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  plates: ClaimedPlate[];
};

export function PickupMap(_props: Props) {
  return (
    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: '#14181C' }}>
      <Text style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted, fontSize: 13 }}>
        Maps are available on iOS, Android, and web.
      </Text>
    </View>
  );
}
