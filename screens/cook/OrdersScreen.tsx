import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { PurchasedTicket, TicketStatus } from './types';

type Props = {
  tickets: PurchasedTicket[];
  loading?: boolean;
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  active: cookTheme.success,
  expired: cookTheme.textMuted,
  cancelled: cookTheme.live,
};

function formatPurchaseDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** @deprecated Use ticket history in CartScreen */
export function OrdersScreen({ tickets, loading }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Ticket history
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Live stream tickets you've purchased.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={cookTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {tickets.length === 0 ? (
            <View
              className="mt-6 rounded-2xl border border-white/10 px-5 py-8"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <Ionicons name="ticket-outline" size={32} color={cookTheme.textMuted} />
              <Text className="mt-3 text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                No tickets yet
              </Text>
              <Text
                className="mt-2 text-[13px] leading-5"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                Buy a ticket from a live cook on For You — it will show up here.
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => {
              return (
                <View
                  key={ticket.id}
                  className="mb-3 overflow-hidden rounded-2xl border border-white/10"
                  style={{ backgroundColor: cookTheme.surface }}
                >
                  <View className="flex-row">
                    {ticket.ticketImageUrl ? (
                      <Image
                        source={{ uri: ticket.ticketImageUrl }}
                        className="h-28 w-24 bg-white/5"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-28 w-24 items-center justify-center bg-white/5">
                        <Ionicons name="ticket-outline" size={28} color={cookTheme.textMuted} />
                      </View>
                    )}
                    <View className="flex-1 justify-center px-3.5 py-3">
                      <View className="flex-row items-start justify-between gap-2">
                        <Text
                          className="flex-1 text-[15px] text-white"
                          style={{ fontFamily: 'Syne_700Bold' }}
                          numberOfLines={1}
                        >
                          {ticket.ticketLabel}
                        </Text>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        >
                          <Text
                            className="text-[10px] uppercase tracking-wide"
                            style={{
                              fontFamily: 'DMSans_600SemiBold',
                              color: STATUS_COLOR[ticket.status],
                            }}
                          >
                            {STATUS_LABEL[ticket.status]}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                        numberOfLines={1}
                      >
                        {ticket.stream.chefName} · {ticket.stream.dishName}
                      </Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text
                          className="text-[13px] text-white"
                          style={{ fontFamily: 'DMSans_600SemiBold' }}
                        >
                          ${ticket.amount}
                        </Text>
                        <Text
                          className="text-[11px]"
                          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                        >
                          {formatPurchaseDate(ticket.purchasedAt)}
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
