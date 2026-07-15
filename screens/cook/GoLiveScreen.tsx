import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';

export function GoLiveScreen() {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: cookTheme.bg }}>
      <View
        className="h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: cookTheme.accent }}
      >
        <Ionicons name="videocam" size={34} color="#fff" />
      </View>
      <Text
        className="mt-5 text-center text-[28px] text-white"
        style={{ fontFamily: 'Syne_800ExtraBold' }}
      >
        Go live & cook
      </Text>
      <Text
        className="mt-2 text-center text-[14px] leading-5"
        style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
      >
        Stream your kitchen, set a donation goal, and let neighbors claim plates for pickup.
      </Text>
      <View
        className="mt-6 rounded-full px-6 py-3"
        style={{ backgroundColor: cookTheme.surfaceElevated }}
      >
        <Text className="text-[13px] text-white/70" style={{ fontFamily: 'DMSans_500Medium' }}>
          Coming next — camera + stream setup
        </Text>
      </View>
    </View>
  );
}
