import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { useAuth } from '../../hooks/useAuth';
import { UserLocationProvider } from '../../hooks/useUserLocation';
import { useWebLayout } from '../../hooks/useWebLayout';
import { CreatorProfileScreen } from '../../screens/cook/CreatorProfileScreen';
import { FeedScreen } from '../../screens/cook/FeedScreen';
import { GoLiveScreen } from '../../screens/cook/GoLiveScreen';
import { LoginScreen } from '../../screens/cook/LoginScreen';
import { MapScreen } from '../../screens/cook/MapScreen';
import { OrdersScreen } from '../../screens/cook/OrdersScreen';
import { ProfileScreen } from '../../screens/cook/ProfileScreen';
import type { ClaimedPlate } from '../../screens/cook/types';
import { createPlateOrder, fetchOrderHistory } from '../../lib/plateOrders';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, TabId } from '../../types/live';

type CreatorOverlay = {
  creatorKey: string;
  startPostId?: string;
};

export function AppShell() {
  const { user, loading, configured } = useAuth();
  const { isDesktop } = useWebLayout();
  const { height, width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const [plates, setPlates] = useState<ClaimedPlate[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [creatorOverlay, setCreatorOverlay] = useState<CreatorOverlay | null>(null);

  useEffect(() => {
    if (!user) {
      setPlates([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    fetchOrderHistory(user.id)
      .then((orders) => {
        if (!cancelled) setPlates(orders);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const onDonated = useCallback(
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
        status: 'confirmed',
      };

      setPlates((prev) => [optimistic, ...prev]);
      setActiveTab('map');

      if (!user) return;

      try {
        const row = await createPlateOrder({
          buyerId: user.id,
          postId: stream.id,
          plateId,
          plateLabel: label,
          amount,
        });

        setPlates((prev) =>
          prev.map((order) =>
            order.id === optimistic.id
              ? {
                  ...order,
                  id: row?.id ?? order.id,
                  claimedAt: row ? new Date(row.created_at).getTime() : order.claimedAt,
                }
              : order,
          ),
        );
      } catch (e) {
        console.warn('[AppShell] save order failed:', e);
      }
    },
    [user],
  );

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
      content = <FeedScreen onDonated={onDonated} onOpenCreator={onOpenCreator} />;
      break;
    case 'map':
      content = <MapScreen plates={plates} />;
      break;
    case 'go-live':
      content = <GoLiveScreen />;
      break;
    case 'orders':
      content = <OrdersScreen plates={plates} loading={ordersLoading} />;
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
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
              </View>
            ) : null}
            {creatorOverlay ? (
              <View className="absolute inset-0 z-[200]">
                <CreatorProfileScreen
                  creatorKey={creatorOverlay.creatorKey}
                  startPostId={creatorOverlay.startPostId}
                  onBack={() => setCreatorOverlay(null)}
                  onDonate={(stream) => onDonated(stream, stream.minDonation)}
                />
              </View>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </UserLocationProvider>
  );
}
