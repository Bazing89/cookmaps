import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { useAuth } from '../../hooks/useAuth';
import { UserLocationProvider } from '../../hooks/useUserLocation';
import { useWebLayout } from '../../hooks/useWebLayout';
import { CartScreen } from '../../screens/cook/CartScreen';
import { CreatorProfileScreen } from '../../screens/cook/CreatorProfileScreen';
import { FeedScreen } from '../../screens/cook/FeedScreen';
import { GoLiveScreen } from '../../screens/cook/GoLiveScreen';
import { LoginScreen } from '../../screens/cook/LoginScreen';
import { MapScreen } from '../../screens/cook/MapScreen';
import { ProfileScreen } from '../../screens/cook/ProfileScreen';
import type { CartItem, ClaimedPlate } from '../../screens/cook/types';
import { createPlateOrder, fetchOrderHistory } from '../../lib/plateOrders';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, PlateOffering, TabId } from '../../types/live';

type CreatorOverlay = {
  creatorKey: string;
  startPostId?: string;
};

function cartItemKey(streamId: string, plateId: string) {
  return `${streamId}:${plateId}`;
}

export function AppShell() {
  const { user, loading, configured } = useAuth();
  const { isDesktop } = useWebLayout();
  const { height, width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ClaimedPlate[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [cartView, setCartView] = useState<'cart' | 'orders'>('cart');
  const [creatorOverlay, setCreatorOverlay] = useState<CreatorOverlay | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    fetchOrderHistory(user.id)
      .then((history) => {
        if (!cancelled) setOrders(history);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToCart = useCallback((stream: LiveStream, plate: PlateOffering) => {
    setCartItems((prev) => {
      const key = cartItemKey(stream.id, plate.id);
      if (prev.some((item) => cartItemKey(item.stream.id, item.plateId) === key)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `cart-${key}-${Date.now()}`,
          stream,
          plateId: plate.id,
          plateLabel: plate.label,
          plateImageUrl: plate.imageUrl ?? null,
          amount: plate.price,
        },
      ];
    });
    setCartView('cart');
    setActiveTab('cart');
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const placeOrder = useCallback(
    async (stream: LiveStream, amount: number, plateId?: string, plateLabel?: string) => {
      const label =
        plateLabel ??
        stream.plates?.find((plate) => plate.id === plateId)?.label ??
        `Plate · $${amount}`;

      const optimistic: ClaimedPlate = {
        id: `temp-${stream.id}-${Date.now()}`,
        stream,
        amount,
        claimedAt: Date.now(),
        plateId,
        plateLabel: label,
        plateImageUrl:
          stream.plates?.find((plate) => plate.id === plateId)?.imageUrl ??
          stream.plates?.find((plate) => plate.label === label)?.imageUrl ??
          null,
        status: 'confirmed',
      };

      setOrders((prev) => [optimistic, ...prev]);

      if (!user) return optimistic;

      try {
        const row = await createPlateOrder({
          buyerId: user.id,
          postId: stream.id,
          plateId,
          plateLabel: label,
          amount,
        });

        if (row) {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === optimistic.id
                ? {
                    ...order,
                    id: row.id,
                    claimedAt: new Date(row.created_at).getTime(),
                  }
                : order,
            ),
          );
        }
      } catch (e) {
        console.warn('[AppShell] save order failed:', e);
      }

      return optimistic;
    },
    [user],
  );

  const checkoutCart = useCallback(async () => {
    if (!cartItems.length) return;

    setCheckoutBusy(true);
    try {
      for (const item of cartItems) {
        await placeOrder(item.stream, item.amount, item.plateId, item.plateLabel);
      }
      setCartItems([]);
      setCartView('orders');
      setActiveTab('cart');
    } finally {
      setCheckoutBusy(false);
    }
  }, [cartItems, placeOrder]);

  const onOpenCreator = useCallback((creatorKey: string, postId?: string) => {
    setCreatorOverlay({ creatorKey, startPostId: postId });
  }, []);

  const webFill =
    Platform.OS === 'web'
      ? { minHeight: height, minWidth: width, flex: 1 as const }
      : { flex: 1 as const };

  if (configured && loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: cookTheme.bg }}>
        <ActivityIndicator color={cookTheme.accent} size="large" />
      </View>
    );
  }

  if (configured && !user) {
    return <LoginScreen />;
  }

  let content: ReactNode;
  switch (activeTab) {
    case 'live':
      content = <FeedScreen onAddToCart={addToCart} onOpenCreator={onOpenCreator} />;
      break;
    case 'map':
      content = <MapScreen plates={orders} onAddToCart={addToCart} />;
      break;
    case 'go-live':
      content = <GoLiveScreen />;
      break;
    case 'cart':
      content = (
        <CartScreen
          cartItems={cartItems}
          orders={orders}
          ordersLoading={ordersLoading}
          checkoutBusy={checkoutBusy}
          view={cartView}
          onViewChange={setCartView}
          onRemoveFromCart={removeFromCart}
          onCheckout={() => void checkoutCart()}
        />
      );
      break;
    case 'profile':
      content = <ProfileScreen />;
      break;
  }

  return (
    <UserLocationProvider>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: cookTheme.bg }}
        edges={isDesktop ? ['top'] : ['top', 'left', 'right']}
      >
        <View
          className="flex-1"
          style={[webFill, isDesktop ? { flexDirection: 'row' as const } : undefined]}
        >
          {isDesktop ? <SideNav activeTab={activeTab} onTabChange={setActiveTab} /> : null}
          <View
            className={isDesktop ? 'flex-1' : 'mx-auto w-full max-w-lg flex-1'}
            style={isDesktop ? { minWidth: 0 } : undefined}
          >
            <View className="flex-1">{content}</View>
            {!isDesktop ? (
              <View style={{ zIndex: 100 }}>
                <BottomNav
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  cartCount={cartItems.length}
                />
              </View>
            ) : null}
            {creatorOverlay ? (
              <View className="absolute inset-0 z-[200]">
                <CreatorProfileScreen
                  creatorKey={creatorOverlay.creatorKey}
                  startPostId={creatorOverlay.startPostId}
                  onBack={() => setCreatorOverlay(null)}
                  onDonate={(stream) => {
                    const plate = stream.plates?.[0];
                    if (plate) addToCart(stream, plate);
                    else
                      addToCart(stream, {
                        id: `default-${stream.id}`,
                        label: `Plate · $${stream.minDonation}`,
                        description: stream.dishDescription,
                        price: stream.minDonation,
                      });
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </UserLocationProvider>
  );
}
