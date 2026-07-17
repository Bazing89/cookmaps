import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TicketSheet } from '../../components/cook/DonateSheet';
import { NearbyLiveCard } from '../../components/cook/NearbyPlateCard';
import { PickupMap } from '../../components/map/PickupMap';
import { useFeedVideos } from '../../hooks/useFeedVideos';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useWebLayout } from '../../hooks/useWebLayout';
import { applyStreamDistances, sortStreamsByDistance } from '../../lib/geo';
import { liveListingsFromStreams } from '../../lib/tickets';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, TicketOffering } from '../../types/live';
import type { PurchasedTicket } from './types';

type Props = {
  tickets: PurchasedTicket[];
  onAddTicket: (stream: LiveStream, ticket: TicketOffering) => void;
};

export function MapScreen({ tickets, onAddTicket }: Props) {
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
  const [ticketStream, setTicketStream] = useState<LiveStream | null>(null);

  const chefs = useMemo(
    () => sortStreamsByDistance(applyStreamDistances(streams, userLocation)),
    [streams, userLocation],
  );

  const liveNearYou = useMemo(() => liveListingsFromStreams(chefs), [chefs]);
  const hasUserLocation = userLocation != null;

  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="relative overflow-hidden" style={paneStyle}>
        <PickupMap chefs={chefs} plates={tickets} userLocation={userLocation} />

        <View className="pointer-events-none absolute left-4 top-3 right-4">
          <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Live map
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
            Cooks streaming live near you
          </Text>
        </View>

        {chefs.length === 0 && !loading ? (
          <View className="pointer-events-none absolute inset-0 items-center justify-center px-8">
            <Text className="text-center text-[15px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
              No live cooks on the map yet
            </Text>
            <Text
              className="mt-2 text-center text-[12px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              When cooks go live, they will appear here. Buy a ticket to join their stream.
            </Text>
          </View>
        ) : null}
      </View>

      <View
        className="border-t border-white/10"
        style={{ ...paneStyle, backgroundColor: cookTheme.bg }}
      >
        <View className="flex-row items-end justify-between px-4 pb-2 pt-3">
          <View className="flex-1 pr-3">
            <Text className="text-[20px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
              Live near you
            </Text>
            <Text
              className="mt-0.5 text-[12px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Buy a ticket to watch these cooks live
            </Text>
          </View>
          {liveNearYou.length > 0 ? (
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: cookTheme.surfaceElevated }}>
              <Text className="text-[12px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                {liveNearYou.length}
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
              flexGrow: liveNearYou.length === 0 ? 1 : undefined,
            }}
            showsVerticalScrollIndicator={false}
          >
            {liveNearYou.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6 py-8">
                <Ionicons name="videocam-outline" size={36} color={cookTheme.textMuted} />
                <Text
                  className="mt-3 text-center text-[15px] text-white"
                  style={{ fontFamily: 'DMSans_500Medium' }}
                >
                  No live streams right now
                </Text>
                <Text
                  className="mt-1 text-center text-[13px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Check For You for upcoming cooks, or come back when someone goes live.
                </Text>
              </View>
            ) : (
              liveNearYou.map((listing) => (
                <NearbyLiveCard
                  key={listing.ticketId}
                  listing={listing}
                  hasUserLocation={hasUserLocation}
                  onPress={() => setTicketStream(listing.stream)}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <TicketSheet
        visible={ticketStream != null}
        stream={ticketStream}
        onClose={() => setTicketStream(null)}
        onAddTicket={(ticket) => {
          if (!ticketStream) return;
          onAddTicket(ticketStream, ticket);
          setTicketStream(null);
        }}
      />
    </View>
  );
}
