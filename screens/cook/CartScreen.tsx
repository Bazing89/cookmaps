import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { CartItem, ClaimedPlate, OrderStatus } from './types';

type Props = {
  cartItems: CartItem[];
  orders: ClaimedPlate[];
  ordersLoading?: boolean;
  checkoutBusy?: boolean;
  view: 'cart' | 'orders';
  onViewChange: (view: 'cart' | 'orders') => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onCheckout: () => void;
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
        {item.plateImageUrl ? (
          <Image
            source={{ uri: item.plateImageUrl }}
            className="h-28 w-24 bg-white/5"
            resizeMode="cover"
          />
        ) : (
          <View className="h-28 w-24 items-center justify-center bg-white/5">
            <Ionicons name="restaurant-outline" size={28} color={cookTheme.textMuted} />
          </View>
        )}
        <View className="min-w-0 flex-1 justify-center px-3.5 py-3">
          <Text
            className="text-[15px] text-white"
            style={{ fontFamily: 'Syne_700Bold' }}
            numberOfLines={1}
          >
            {item.plateLabel}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            numberOfLines={1}
          >
            {item.stream.chefName} · {item.stream.pickupNeighborhood || 'Pickup nearby'}
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

function OrderLine({ order }: { order: ClaimedPlate }) {
  return (
    <View
      className="mb-3 overflow-hidden rounded-2xl border border-white/10"
      style={{ backgroundColor: cookTheme.surface }}
    >
      <View className="flex-row">
        {order.plateImageUrl ? (
          <Image
            source={{ uri: order.plateImageUrl }}
            className="h-28 w-24 bg-white/5"
            resizeMode="cover"
          />
        ) : (
          <View className="h-28 w-24 items-center justify-center bg-white/5">
            <Ionicons name="restaurant-outline" size={28} color={cookTheme.textMuted} />
          </View>
        )}
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
            <Text className="text-[13px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
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
}

export function CartScreen({
  cartItems,
  orders,
  ordersLoading,
  checkoutBusy,
  view,
  onViewChange,
  onRemoveFromCart,
  onCheckout,
}: Props) {
  const cartTotal = cartItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="px-5 pb-3 pt-4">
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Cart
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          {view === 'cart'
            ? 'Review plates before you place your order.'
            : 'Past plates you ordered from local cooks.'}
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
                  name={tab === 'cart' ? 'cart-outline' : 'receipt-outline'}
                  size={16}
                  color="#fff"
                />
                <Text
                  className="ml-1.5 text-[13px] text-white"
                  style={{
                    fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_500Medium',
                  }}
                >
                  {tab === 'cart' ? 'Cart' : 'Order history'}
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
                <Ionicons name="cart-outline" size={32} color={cookTheme.textMuted} />
                <Text className="mt-3 text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                  Your cart is empty
                </Text>
                <Text
                  className="mt-2 text-[13px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Tap Order now on a plate in For You to add it here before checkout.
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
                  Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
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
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text className="ml-2 text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                      Place order
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}
        </>
      ) : ordersLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={cookTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {orders.length === 0 ? (
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
                After you place an order from your cart, it will show up here with pickup status.
              </Text>
            </View>
          ) : (
            orders.map((order) => <OrderLine key={order.id} order={order} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}
