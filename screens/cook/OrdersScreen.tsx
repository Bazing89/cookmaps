import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { resolveStreamThumbnail } from '../../lib/bunnyStream';
import { cookTheme } from '../../theme/cookTheme';
import type { ClaimedPlate, OrderStatus } from './types';

type Props = {
  plates: ClaimedPlate[];
  loading?: boolean;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  confirmed: cookTheme.accentSoft,
  ready: cookTheme.success,
  picked_up: cookTheme.textMuted,
  cancelled: cookTheme.live,
};

function formatOrderDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OrdersScreen({ plates, loading }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Order history
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Plates you've bought from local cooks.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={cookTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {plates.length === 0 ? (
            <View
              className="mt-6 rounded-2xl border border-white/10 px-5 py-8"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <Ionicons name="receipt-outline" size={32} color={cookTheme.textMuted} />
              <Text className="mt-3 text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                No orders yet
              </Text>
              <Text
                className="mt-2 text-[13px] leading-5"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                Claim a plate from a short or live stream on For You — your order will show up here.
              </Text>
            </View>
          ) : (
            plates.map((order) => {
              const cover = resolveStreamThumbnail(
                order.stream.coverImage,
                order.stream.bunnyVideoId,
                order.stream.thumbnailUrl,
              );

              return (
                <View
                  key={order.id}
                  className="mb-3 overflow-hidden rounded-2xl border border-white/10"
                  style={{ backgroundColor: cookTheme.surface }}
                >
                  <View className="flex-row">
                    <Image source={{ uri: cover }} className="h-28 w-24" />
                    <View className="flex-1 justify-center px-3.5 py-3">
                      <View className="flex-row items-start justify-between gap-2">
                        <Text
                          className="flex-1 text-[15px] text-white"
                          style={{ fontFamily: 'Syne_700Bold' }}
                          numberOfLines={1}
                        >
                          {order.plateLabel}
                        </Text>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        >
                          <Text
                            className="text-[10px] uppercase tracking-wide"
                            style={{
                              fontFamily: 'DMSans_600SemiBold',
                              color: STATUS_COLOR[order.status],
                            }}
                          >
                            {STATUS_LABEL[order.status]}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                        numberOfLines={1}
                      >
                        {order.stream.chefName} · {order.stream.dishName}
                      </Text>
                      {order.stream.pickupNeighborhood ? (
                        <Text
                          className="mt-0.5 text-[12px]"
                          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                          numberOfLines={1}
                        >
                          Pickup · {order.stream.pickupNeighborhood}
                        </Text>
                      ) : null}
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text
                          className="text-[13px] text-white"
                          style={{ fontFamily: 'DMSans_600SemiBold' }}
                        >
                          ${order.amount}
                        </Text>
                        <Text
                          className="text-[11px]"
                          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                        >
                          {formatOrderDate(order.claimedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
