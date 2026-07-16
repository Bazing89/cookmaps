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
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { AppShell } from './components/cook/AppShell';
import { AuthProvider } from './hooks/useAuth';
import { cookTheme } from './theme/cookTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
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

  if (!fontsReady) {
    return <View className="flex-1" style={{ backgroundColor: cookTheme.bg }} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppShell />
    </AuthProvider>
  );
}
