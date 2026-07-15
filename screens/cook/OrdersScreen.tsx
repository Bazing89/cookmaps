import { Image, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { ClaimedPlate } from './types';

type Props = {
  plates: ClaimedPlate[];
};

export function OrdersScreen({ plates }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Your plates
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Donations that unlock food pickup.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {plates.length === 0 ? (
          <View
            className="mt-6 rounded-2xl border border-white/10 px-5 py-8"
            style={{ backgroundColor: cookTheme.surface }}
          >
            <Text className="text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
              Empty plate rack
            </Text>
            <Text
              className="mt-2 text-[13px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Back a live chef from the feed and your claimed plate lands here.
            </Text>
          </View>
        ) : (
          plates.map((plate) => (
            <View
              key={plate.id}
              className="mb-3 flex-row overflow-hidden rounded-2xl border border-white/10"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <Image source={{ uri: plate.stream.coverImage }} className="h-28 w-24" />
              <View className="flex-1 justify-center px-3.5 py-3">
                <Text className="text-[15px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                  {plate.stream.dishName}
                </Text>
                <Text
                  className="mt-1 text-[12px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  {plate.stream.chefName} · {plate.stream.pickupNeighborhood}
                </Text>
                <Text
                  className="mt-2 text-[12px]"
                  style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.accentSoft }}
                >
                  ${plate.amount} · ready ~{plate.stream.readyInMinutes}m
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
