import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { formatDistanceLabel } from '../../lib/geo';
import type { NearbyLiveListing } from '../../lib/tickets';
import { cookTheme } from '../../theme/cookTheme';
import { CreatorAvatar } from './CreatorAvatar';

type Props = {
  listing: NearbyLiveListing;
  hasUserLocation: boolean;
  onPress: () => void;
};

/** @deprecated Use NearbyLiveCard */
export const NearbyPlateCard = NearbyLiveCard;

export function NearbyLiveCard({ listing, hasUserLocation, onPress }: Props) {
  const { stream, label, description, price, imageUrl } = listing;

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row overflow-hidden rounded-2xl border border-white/10"
      style={{ backgroundColor: cookTheme.surfaceElevated }}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="h-28 w-28 bg-white/5" resizeMode="cover" />
      ) : (
        <View className="h-28 w-28 items-center justify-center bg-white/5">
          <Ionicons name="ticket-outline" size={28} color={cookTheme.textMuted} />
        </View>
      )}

      <View className="min-w-0 flex-1 justify-center px-3 py-2.5">
        <View className="mb-1 flex-row items-center">
          <View
            className="mr-2 flex-row items-center rounded px-1.5 py-0.5"
            style={{ backgroundColor: cookTheme.live }}
          >
            <View className="mr-1 h-1.5 w-1.5 rounded-full bg-white" />
            <Text className="text-[9px] font-bold text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              LIVE
            </Text>
          </View>
          <Text className="text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }} numberOfLines={1}>
            {stream.dishName}
          </Text>
        </View>
        {description ? (
          <Text
            className="mt-0.5 text-[12px] leading-4"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}

        <View className="mt-2 flex-row items-center">
          <CreatorAvatar uri={stream.chefAvatar} name={stream.chefName} size={22} />
          <Text
            className="ml-2 flex-1 text-[12px] text-white/90"
            style={{ fontFamily: 'DMSans_500Medium' }}
            numberOfLines={1}
          >
            {stream.chefName}
          </Text>
        </View>

        <View className="mt-1.5 flex-row items-center justify-between gap-2">
          <Text
            className="min-w-0 flex-1 text-[11px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            numberOfLines={1}
          >
            {formatDistanceLabel(stream.distanceMiles, hasUserLocation)} · watch live
          </Text>
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: cookTheme.accent }}>
            <Text className="text-[13px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              ${price}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
