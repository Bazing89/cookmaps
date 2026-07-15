import './global.css';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './components/str/BottomNav';
import { BookingScreen } from './screens/str/BookingScreen';
import { ExploreScreen } from './screens/str/ExploreScreen';
import { ListingDetailScreen } from './screens/str/ListingDetailScreen';
import { ProfileScreen } from './screens/str/ProfileScreen';
import { TripsScreen } from './screens/str/TripsScreen';
import { WishlistsScreen } from './screens/str/WishlistsScreen';
import type { BookedTrip, Listing, TabId } from './types/listing';

type Screen =
  | { name: 'tabs' }
  | { name: 'detail'; listing: Listing }
  | { name: 'booking'; listing: Listing };

export default function App() {
  const { height, width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [screen, setScreen] = useState<Screen>({ name: 'tabs' });
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [trips, setTrips] = useState<BookedTrip[]>([]);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    for (const el of [document.documentElement, document.body, document.getElementById('root')]) {
      if (!el) continue;
      el.style.height = '100%';
      el.style.margin = '0';
    }
  }, []);

  const toggleWishlist = useCallback((listingId: string) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) next.delete(listingId);
      else next.add(listingId);
      return next;
    });
  }, []);

  const openListing = useCallback((listing: Listing) => {
    setScreen({ name: 'detail', listing });
  }, []);

  const openBooking = useCallback((listing: Listing) => {
    setScreen({ name: 'booking', listing });
  }, []);

  const confirmBooking = useCallback((trip: BookedTrip) => {
    setTrips((prev) => [trip, ...prev]);
    setActiveTab('trips');
    setScreen({ name: 'tabs' });
  }, []);

  const webFill =
    Platform.OS === 'web'
      ? { minHeight: height, minWidth: width, flex: 1 as const }
      : { flex: 1 as const };

  const showBottomNav = screen.name === 'tabs';

  let content: ReactNode;

  if (screen.name === 'detail') {
    content = (
      <ListingDetailScreen
        listing={screen.listing}
        isWishlisted={wishlistedIds.has(screen.listing.id)}
        onBack={() => setScreen({ name: 'tabs' })}
        onToggleWishlist={() => toggleWishlist(screen.listing.id)}
        onReserve={() => openBooking(screen.listing)}
      />
    );
  } else if (screen.name === 'booking') {
    content = (
      <BookingScreen
        listing={screen.listing}
        onBack={() => setScreen({ name: 'detail', listing: screen.listing })}
        onConfirm={confirmBooking}
      />
    );
  } else {
    content = (
      <>
        <View className="flex-1">
          {activeTab === 'explore' && (
            <ExploreScreen
              wishlistedIds={wishlistedIds}
              onListingPress={openListing}
              onToggleWishlist={toggleWishlist}
            />
          )}
          {activeTab === 'wishlists' && (
            <WishlistsScreen
              wishlistedIds={wishlistedIds}
              onListingPress={openListing}
              onToggleWishlist={toggleWishlist}
            />
          )}
          {activeTab === 'trips' && <TripsScreen trips={trips} onListingPress={openListing} />}
          {activeTab === 'profile' && <ProfileScreen />}
        </View>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  const safeEdges = showBottomNav
    ? (['top', 'left', 'right'] as const)
    : (['top', 'left', 'right', 'bottom'] as const);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={safeEdges}>
      <StatusBar style="dark" />
      <View className="mx-auto w-full max-w-5xl flex-1" style={webFill}>
        {content}
      </View>
    </SafeAreaView>
  );
}
