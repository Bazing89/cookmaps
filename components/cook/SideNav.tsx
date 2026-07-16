import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { TabId } from '../../types/live';

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const NAV_ITEMS: {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'live', label: 'For You', icon: 'home-outline', activeIcon: 'home' },
  { id: 'map', label: 'Map', icon: 'map-outline', activeIcon: 'map' },
  { id: 'go-live', label: 'Cook', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { id: 'orders', label: 'Orders', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export function SideNav({ activeTab, onTabChange }: Props) {
  return (
    <View
      className="h-full border-r border-white/10 px-3 py-6"
      style={{ width: 256, backgroundColor: cookTheme.bg }}
    >
      <View className="mb-8 px-2" style={{ overflow: 'visible' }}>
        <Text
          className="text-white"
          style={{
            fontFamily: 'Syne_800ExtraBold',
            fontSize: 24,
            letterSpacing: -0.3,
            flexShrink: 0,
            ...(Platform.OS === 'web'
              ? ({ whiteSpace: 'nowrap', overflow: 'visible' } as const)
              : {}),
          }}
        >
          CookMapz
        </Text>
      </View>

      <View className="gap-1">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onTabChange(item.id)}
              className="flex-row items-center rounded-lg px-3 py-2.5"
              style={active ? { backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={24}
                color={active ? '#fff' : cookTheme.textMuted}
              />
              <Text
                className="ml-3 text-[16px]"
                style={{
                  fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_500Medium',
                  color: active ? '#fff' : cookTheme.textMuted,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
