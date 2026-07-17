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
import type { CartItem, PurchasedTicket } from '../../screens/cook/types';
import { createTicketPurchase, fetchTicketHistory } from '../../lib/plateOrders';
import { primaryTicketForStream } from '../../lib/tickets';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, TabId, TicketOffering } from '../../types/live';

type CreatorOverlay = {
  creatorKey: string;
  startPostId?: string;
};

function cartItemKey(streamId: string, ticketId: string) {
  return `${streamId}:${ticketId}`;
}

export function AppShell() {
  const { user, loading, configured } = useAuth();
  const { isDesktop } = useWebLayout();
  const { height, width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [cartView, setCartView] = useState<'cart' | 'orders'>('cart');
  const [creatorOverlay, setCreatorOverlay] = useState<CreatorOverlay | null>(null);
  const [focusStreamId, setFocusStreamId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTickets([]);
      return;
    }

    let cancelled = false;
    setTicketsLoading(true);
    fetchTicketHistory(user.id)
      .then((history) => {
        if (!cancelled) setTickets(history);
      })
      .finally(() => {
        if (!cancelled) setTicketsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addTicketToCart = useCallback((stream: LiveStream, ticket: TicketOffering) => {
    setCartItems((prev) => {
      const key = cartItemKey(stream.id, ticket.id);
      if (prev.some((item) => cartItemKey(item.stream.id, item.ticketId) === key)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `cart-${key}-${Date.now()}`,
          stream,
          ticketId: ticket.id,
          ticketLabel: ticket.label,
          ticketImageUrl: ticket.imageUrl ?? null,
          amount: ticket.price,
        },
      ];
    });
    setCartView('cart');
    setActiveTab('cart');
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const purchaseTicket = useCallback(
    async (
      stream: LiveStream,
      amount: number,
      ticketId?: string,
      ticketLabel?: string,
    ) => {
      const label =
        ticketLabel ??
        stream.tickets?.find((ticket) => ticket.id === ticketId)?.label ??
        primaryTicketForStream(stream).label;

      const optimistic: PurchasedTicket = {
        id: `temp-${stream.id}-${Date.now()}`,
        stream,
        amount,
        purchasedAt: Date.now(),
        ticketId,
        ticketLabel: label,
        ticketImageUrl:
          stream.tickets?.find((ticket) => ticket.id === ticketId)?.imageUrl ??
          stream.tickets?.find((ticket) => ticket.label === label)?.imageUrl ??
          stream.coverImage ??
          null,
        status: 'active',
      };

      setTickets((prev) => [optimistic, ...prev]);

      if (!user) return optimistic;

      try {
        const row = await createTicketPurchase({
          buyerId: user.id,
          postId: stream.id,
          ticketId,
          ticketLabel: label,
          amount,
        });

        if (row) {
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === optimistic.id
                ? {
                    ...ticket,
                    id: row.id,
                    purchasedAt: new Date(row.created_at).getTime(),
                  }
                : ticket,
            ),
          );
        }
      } catch (e) {
        console.warn('[AppShell] save ticket failed:', e);
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
        await purchaseTicket(item.stream, item.amount, item.ticketId, item.ticketLabel);
      }
      setCartItems([]);
      setCartView('orders');
      setActiveTab('cart');
    } finally {
      setCheckoutBusy(false);
    }
  }, [cartItems, purchaseTicket]);

  const joinLive = useCallback((streamId: string) => {
    setFocusStreamId(streamId);
    setActiveTab('live');
  }, []);

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

  if (!configured || !user) {
    return <LoginScreen />;
  }

  let content: ReactNode;
  switch (activeTab) {
    case 'live':
      content = (
        <FeedScreen
          onAddTicket={addTicketToCart}
          onOpenCreator={onOpenCreator}
          purchasedTickets={tickets}
          viewerId={user.id}
          focusStreamId={focusStreamId}
          onFocusStreamHandled={() => setFocusStreamId(null)}
        />
      );
      break;
    case 'map':
      content = <MapScreen tickets={tickets} onAddTicket={addTicketToCart} />;
      break;
    case 'go-live':
      content = <GoLiveScreen />;
      break;
    case 'cart':
      content = (
        <CartScreen
          cartItems={cartItems}
          tickets={tickets}
          ticketsLoading={ticketsLoading}
          checkoutBusy={checkoutBusy}
          view={cartView}
          onViewChange={setCartView}
          onRemoveFromCart={removeFromCart}
          onCheckout={() => void checkoutCart()}
          onJoinLive={joinLive}
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
                    addTicketToCart(stream, primaryTicketForStream(stream));
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
