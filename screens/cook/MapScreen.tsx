import { ScrollView, Text, View } from 'react-native';
import { useMemo } from 'react';
import { PickupMap } from '../../components/map/PickupMap';
import { useFeedVideos } from '../../hooks/useFeedVideos';
import { useUserLocation } from '../../hooks/useUserLocation';
import { applyStreamDistances, sortStreamsByDistance } from '../../lib/geo';
import { cookTheme } from '../../theme/cookTheme';
import type { ClaimedPlate } from './types';

type Props = {
  plates: ClaimedPlate[];
};

export function MapScreen({ plates }: Props) {
  const { location: userLocation } = useUserLocation();
  const { streams } = useFeedVideos();

  const chefs = useMemo(
    () => sortStreamsByDistance(applyStreamDistances(streams, userLocation)),
    [streams, userLocation],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="relative flex-1 overflow-hidden">
        <PickupMap chefs={chefs} plates={plates} userLocation={userLocation} />

        <View className="pointer-events-none absolute left-6 top-8 right-6">
          <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Pickup map
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Chefs near you — donate to unlock pickup.
          </Text>
        </View>

        {chefs.length === 0 ? (
          <View className="pointer-events-none absolute inset-0 items-center justify-center px-8">
            <Text
              className="text-center text-[16px] text-white"
              style={{ fontFamily: 'Syne_700Bold' }}
            >
              No chefs on the map yet
            </Text>
            <Text
              className="mt-2 text-center text-[13px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Add videos to your Bunny library with a pickup address to see them here.
            </Text>
          </View>
        ) : null}
      </View>

      {plates.length > 0 ? (
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
                {plate.plateLabel}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                {plate.stream.chefName} · {plate.stream.pickupAddress || plate.stream.pickupNeighborhood}
              </Text>
              <Text
                className="mt-2 text-[12px]"
                style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.accentSoft }}
              >
                Ready in ~{plate.stream.readyInMinutes}m · ${plate.amount}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
