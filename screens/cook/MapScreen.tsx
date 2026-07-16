import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonateSheet } from '../../components/cook/DonateSheet';
import { NearbyPlateCard } from '../../components/cook/NearbyPlateCard';
import { PickupMap } from '../../components/map/PickupMap';
import { useFeedVideos } from '../../hooks/useFeedVideos';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useWebLayout } from '../../hooks/useWebLayout';
import { applyStreamDistances, sortStreamsByDistance } from '../../lib/geo';
import { plateListingsFromStreams } from '../../lib/plates';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';
import type { ClaimedPlate } from './types';

type Props = {
  plates: ClaimedPlate[];
  onAddToCart: (stream: LiveStream, plate: import('../../types/live').PlateOffering) => void;
};

export function MapScreen({ plates, onAddToCart }: Props) {
  const { location: userLocation } = useUserLocation();
  const { streams, loading } = useFeedVideos();
  const { isDesktop, height: windowHeight } = useWebLayout();
  const insets = useSafeAreaInsets();
  const bottomNavInset = isDesktop ? 0 : 58 + Math.max(insets.bottom, 10);
  const paneHeight = isDesktop
    ? undefined
    : Math.floor((windowHeight - insets.top - bottomNavInset) / 2);
  const paneStyle = isDesktop
    ? ({ flex: 1, minHeight: 0 } as const)
    : ({ height: paneHeight, minHeight: 0 } as const);
  const [claimStream, setClaimStream] = useState<LiveStream | null>(null);

  const chefs = useMemo(
    () => sortStreamsByDistance(applyStreamDistances(streams, userLocation)),
    [streams, userLocation],
  );

  const nearbyPlates = useMemo(() => plateListingsFromStreams(chefs), [chefs]);
  const hasUserLocation = userLocation != null;

  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      {/* Top half — map */}
      <View className="relative overflow-hidden" style={paneStyle}>
        <PickupMap chefs={chefs} plates={plates} userLocation={userLocation} />

        <View className="pointer-events-none absolute left-4 top-3 right-4">
          <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Pickup map
          </Text>
          <Text
            className="mt-0.5 text-[12px]"
            style={{
              fontFamily: 'DMSans_400Regular',
              color: cookTheme.textMuted,
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
          >
            Chefs and kitchens near you
          </Text>
        </View>

        {chefs.length === 0 && !loading ? (
          <View className="pointer-events-none absolute inset-0 items-center justify-center px-8">
            <Text className="text-center text-[15px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
              No chefs on the map yet
            </Text>
            <Text
              className="mt-2 text-center text-[12px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              When cooks go live or post shorts with pickup locations, they will appear here.
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom half — plates for sale */}
      <View
        className="border-t border-white/10"
        style={{ ...paneStyle, backgroundColor: cookTheme.bg }}
      >
        <View className="flex-row items-end justify-between px-4 pb-2 pt-3">
          <View className="flex-1 pr-3">
            <Text className="text-[20px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
              Plates near you
            </Text>
            <Text
              className="mt-0.5 text-[12px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Home-cooked plates available for pickup in your area
            </Text>
          </View>
          {nearbyPlates.length > 0 ? (
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: cookTheme.surfaceElevated }}>
              <Text className="text-[12px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                {nearbyPlates.length}
              </Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={cookTheme.accent} />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: bottomNavInset + 12,
              flexGrow: nearbyPlates.length === 0 ? 1 : undefined,
            }}
            showsVerticalScrollIndicator={false}
          >
            {nearbyPlates.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6 py-8">
                <Ionicons name="restaurant-outline" size={36} color={cookTheme.textMuted} />
                <Text
                  className="mt-3 text-center text-[15px] text-white"
                  style={{ fontFamily: 'DMSans_500Medium' }}
                >
                  No plates listed yet
                </Text>
                <Text
                  className="mt-1 text-center text-[13px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Cooks add plates when they post shorts or go live. Check back soon or browse For You.
                </Text>
              </View>
            ) : (
              nearbyPlates.map((listing) => (
                <NearbyPlateCard
                  key={listing.plateId}
                  listing={listing}
                  hasUserLocation={hasUserLocation}
                  onPress={() => setClaimStream(listing.stream)}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <DonateSheet
        visible={claimStream != null}
        stream={claimStream}
        onClose={() => setClaimStream(null)}
        onAddToCart={(plate) => {
          if (!claimStream) return;
          onAddToCart(claimStream, plate);
          setClaimStream(null);
        }}
      />
    </View>
  );
}
