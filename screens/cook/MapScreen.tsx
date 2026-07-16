import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { PickupMap } from '../../components/map/PickupMap';
import { cookTheme } from '../../theme/cookTheme';
import type { ClaimedPlate } from './types';

type Props = {
  plates: ClaimedPlate[];
};

export function MapScreen({ plates }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="relative flex-1 overflow-hidden">
        <PickupMap plates={plates} />

        <View className="pointer-events-none absolute left-6 top-8 right-6">
          <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Pickup map
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Chefs you’ve backed show up here for walk-up pickup.
          </Text>
        </View>

        {plates.length === 0 && (
          <View className="absolute inset-0 items-center justify-center px-8">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <Ionicons name="navigate" size={28} color={cookTheme.accent} />
            </View>
            <Text
              className="mt-4 text-center text-[16px] text-white"
              style={{ fontFamily: 'Syne_700Bold' }}
            >
              No plates claimed yet
            </Text>
            <Text
              className="mt-2 text-center text-[13px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Swipe Live, donate to a chef, and your pickup pin drops on this map.
            </Text>
          </View>
        )}
      </View>

      {plates.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="absolute bottom-4 left-0 right-0"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {plates.map((plate) => (
            <View
              key={plate.id}
              className="w-64 rounded-2xl border border-white/10 px-3.5 py-3"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <Text className="text-[14px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                {plate.stream.dishName}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                {plate.stream.pickupAddress}
              </Text>
              <Text
                className="mt-2 text-[12px]"
                style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.accentSoft }}
              >
                Ready in ~{plate.stream.readyInMinutes}m · ${plate.amount} donated
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
