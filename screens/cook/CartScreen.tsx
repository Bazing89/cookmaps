import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { CartItem, PurchasedTicket, TicketStatus } from './types';

type Props = {
  cartItems: CartItem[];
  tickets: PurchasedTicket[];
  ticketsLoading?: boolean;
  checkoutBusy?: boolean;
  view: 'cart' | 'orders';
  onViewChange: (view: 'cart' | 'orders') => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onCheckout: () => void;
  onJoinLive: (streamId: string) => void;
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

function CartLine({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) {
  return (
    <View
      className="mb-3 overflow-hidden rounded-2xl border border-white/10"
      style={{ backgroundColor: cookTheme.surface }}
    >
      <View className="flex-row">
        {item.ticketImageUrl ? (
          <Image
            source={{ uri: item.ticketImageUrl }}
            className="h-28 w-24 bg-white/5"
            resizeMode="cover"
          />
        ) : (
          <View className="h-28 w-24 items-center justify-center bg-white/5">
            <Ionicons name="ticket-outline" size={28} color={cookTheme.textMuted} />
          </View>
        )}
        <View className="min-w-0 flex-1 justify-center px-3.5 py-3">
          <Text
            className="text-[15px] text-white"
            style={{ fontFamily: 'Syne_700Bold' }}
            numberOfLines={1}
          >
            {item.ticketLabel}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            numberOfLines={1}
          >
            {item.stream.chefName} · {item.stream.dishName}
          </Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              ${item.amount}
            </Text>
            <Pressable onPress={onRemove} hitSlop={8} className="flex-row items-center">
              <Ionicons name="trash-outline" size={16} color={cookTheme.textMuted} />
              <Text
                className="ml-1 text-[12px]"
                style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.textMuted }}
              >
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function TicketLine({
  ticket,
  onJoinLive,
}: {
  ticket: PurchasedTicket;
  onJoinLive: () => void;
}) {
  const canJoin = ticket.status === 'active' && ticket.stream.isLive;

  return (
    <View
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
          {ticket.stream.isLive ? (
            <View className="mt-1 flex-row items-center">
              <View className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cookTheme.live }} />
              <Text
                className="text-[12px]"
                style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.live }}
              >
                Live now — join to watch
              </Text>
            </View>
          ) : null}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[13px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              ${ticket.amount}
            </Text>
            <Text
              className="text-[11px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              {formatPurchaseDate(ticket.purchasedAt)}
            </Text>
          </View>
          {canJoin ? (
            <Pressable
              onPress={onJoinLive}
              className="mt-3 flex-row items-center justify-center rounded-xl py-2.5"
              style={{ backgroundColor: cookTheme.accent }}
            >
              <Ionicons name="videocam" size={16} color="#fff" />
              <Text className="ml-2 text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                Join live
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function CartScreen({
  cartItems,
  tickets,
  ticketsLoading,
  checkoutBusy,
  view,
  onViewChange,
  onRemoveFromCart,
  onCheckout,
  onJoinLive,
}: Props) {
  const cartTotal = cartItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          My tickets
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          {view === 'cart'
            ? 'Review tickets before checkout — each one unlocks a live cooking stream.'
            : 'Your tickets — join live streams to watch your food being cooked.'}
        </Text>

        <View
          className="mt-4 flex-row rounded-full p-1"
          style={{ backgroundColor: cookTheme.surfaceElevated }}
        >
          {(['cart', 'orders'] as const).map((tab) => {
            const active = view === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => onViewChange(tab)}
                className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
                style={active ? { backgroundColor: cookTheme.accent } : undefined}
              >
                <Ionicons
                  name={tab === 'cart' ? 'cart-outline' : 'ticket-outline'}
                  size={16}
                  color="#fff"
                />
                <Text
                  className="ml-1.5 text-[13px] text-white"
                  style={{
                    fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_500Medium',
                  }}
                >
                  {tab === 'cart' ? 'Cart' : 'My tickets'}
                </Text>
                {tab === 'cart' && cartItems.length > 0 ? (
                  <View
                    className="ml-1.5 min-w-[18px] items-center rounded-full px-1 py-0.5"
                    style={{ backgroundColor: active ? 'rgba(0,0,0,0.25)' : cookTheme.accent }}
                  >
                    <Text className="text-[10px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                      {cartItems.length}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {view === 'cart' ? (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 }}>
            {cartItems.length === 0 ? (
              <View
                className="mt-6 rounded-2xl border border-white/10 px-5 py-8"
                style={{ backgroundColor: cookTheme.surface }}
              >
                <Ionicons name="ticket-outline" size={32} color={cookTheme.textMuted} />
                <Text className="mt-3 text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                  No tickets in cart
                </Text>
                <Text
                  className="mt-2 text-[13px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Tap Buy ticket on a live stream in For You to add a ticket here before checkout.
                </Text>
              </View>
            ) : (
              cartItems.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  onRemove={() => onRemoveFromCart(item.id)}
                />
              ))
            )}
          </ScrollView>

          {cartItems.length > 0 ? (
            <View
              className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-5 py-4"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className="text-[14px] text-white/80"
                  style={{ fontFamily: 'DMSans_500Medium' }}
                >
                  Total ({cartItems.length} {cartItems.length === 1 ? 'ticket' : 'tickets'})
                </Text>
                <Text className="text-[20px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
                  ${cartTotal.toFixed(cartTotal % 1 === 0 ? 0 : 2)}
                </Text>
              </View>
              <Pressable
                onPress={onCheckout}
                disabled={checkoutBusy}
                className="flex-row items-center justify-center rounded-2xl py-3.5"
                style={{ backgroundColor: cookTheme.accent, opacity: checkoutBusy ? 0.7 : 1 }}
              >
                {checkoutBusy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="ticket-outline" size={20} color="#fff" />
                    <Text className="ml-2 text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                      Buy tickets
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}
        </>
      ) : ticketsLoading ? (
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
                Buy a ticket from a live cook, then come back here to join the stream and watch your food being made.
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TicketLine
                key={ticket.id}
                ticket={ticket}
                onJoinLive={() => onJoinLive(ticket.stream.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
