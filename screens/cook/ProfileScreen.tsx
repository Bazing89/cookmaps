import { Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';

export function ProfileScreen() {
  return (
    <View className="flex-1 px-5 pt-4" style={{ backgroundColor: cookTheme.bg }}>
      <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
        You
      </Text>
      <View
        className="mt-6 items-center rounded-3xl border border-white/10 px-5 py-8"
        style={{ backgroundColor: cookTheme.surface }}
      >
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: cookTheme.accent }}
        >
          <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            C
          </Text>
        </View>
        <Text className="mt-4 text-[20px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
          Hungry neighbor
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Watch live · donate · pick up
        </Text>
      </View>
    </View>
  );
}
