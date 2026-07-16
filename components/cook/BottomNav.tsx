import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cookTheme } from '../../theme/cookTheme';
import type { TabId } from '../../types/live';

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const TABS: {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'live', label: 'For You', icon: 'play-outline', activeIcon: 'play' },
  { id: 'map', label: 'Map', icon: 'map-outline', activeIcon: 'map' },
  { id: 'go-live', label: 'Cook', icon: 'radio-outline', activeIcon: 'radio' },
  { id: 'orders', label: 'Orders', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNav({ activeTab, onTabChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-white/10"
      style={{
        backgroundColor: cookTheme.bg,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View className="h-[58px] flex-row items-center justify-around px-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const isCook = tab.id === 'go-live';

          if (isCook) {
            return (
              <Pressable
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                className="items-center justify-center"
                hitSlop={6}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: cookTheme.accent }}
                >
                  <Ionicons name="flame" size={22} color="#fff" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="min-w-[56px] items-center justify-center py-1"
              hitSlop={6}
            >
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={22}
                color={active ? '#fff' : cookTheme.textMuted}
              />
              <Text
                className="mt-0.5 text-[10px]"
                style={{
                  fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                  color: active ? '#fff' : cookTheme.textMuted,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
