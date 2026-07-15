import './global.css';

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  useFonts as useDmSans,
} from '@expo-google-fonts/dm-sans';
import {
  Syne_700Bold,
  Syne_800ExtraBold,
  useFonts as useSyne,
} from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './components/cook/BottomNav';
import { FeedScreen } from './screens/cook/FeedScreen';
import { GoLiveScreen } from './screens/cook/GoLiveScreen';
import { MapScreen } from './screens/cook/MapScreen';
import { OrdersScreen } from './screens/cook/OrdersScreen';
import { ProfileScreen } from './screens/cook/ProfileScreen';
import type { ClaimedPlate } from './screens/cook/types';
import { cookTheme } from './theme/cookTheme';
import type { LiveStream, TabId } from './types/live';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const { height, width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const [plates, setPlates] = useState<ClaimedPlate[]>([]);

  const [syneLoaded] = useSyne({ Syne_700Bold, Syne_800ExtraBold });
  const [dmLoaded] = useDmSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const fontsReady = syneLoaded && dmLoaded;

  useEffect(() => {
    if (fontsReady) void SplashScreen.hideAsync();
  }, [fontsReady]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    for (const el of [document.documentElement, document.body, document.getElementById('root')]) {
      if (!el) continue;
      el.style.height = '100%';
      el.style.margin = '0';
      el.style.backgroundColor = cookTheme.bg;
    }
  }, []);

  const onDonated = useCallback((stream: LiveStream, amount: number) => {
    setPlates((prev) => [
      {
        id: `${stream.id}-${Date.now()}`,
        stream,
        amount,
        claimedAt: Date.now(),
      },
      ...prev,
    ]);
    setActiveTab('map');
  }, []);

  const webFill =
    Platform.OS === 'web'
      ? { minHeight: height, minWidth: width, flex: 1 as const }
      : { flex: 1 as const };

  if (!fontsReady) {
    return <View className="flex-1" style={{ backgroundColor: cookTheme.bg }} />;
  }

  let content: ReactNode;
  switch (activeTab) {
    case 'live':
      content = <FeedScreen onDonated={onDonated} />;
      break;
    case 'map':
      content = <MapScreen plates={plates} />;
      break;
    case 'go-live':
      content = <GoLiveScreen />;
      break;
    case 'orders':
      content = <OrdersScreen plates={plates} />;
      break;
    case 'profile':
      content = <ProfileScreen />;
      break;
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="light" />
      <View className="mx-auto w-full max-w-lg flex-1" style={webFill}>
        <View className="flex-1">{content}</View>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
