import { Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import { GooglePickupMap } from './GooglePickupMap';
import { PickupMapNativeFallback } from './PickupMapNativeFallback';
import type { PickupMapProps } from './types';

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function PickupMap(props: PickupMapProps) {
  if (!apiKey) {
    return (
      <View style={{ flex: 1, backgroundColor: cookTheme.bg }}>
        <PickupMapNativeFallback {...props} />
        <View
          style={{
            position: 'absolute',
            bottom: 24,
            left: 16,
            right: 16,
            borderRadius: 12,
            backgroundColor: cookTheme.surface,
            padding: 12,
          }}
        >
          <Text style={{ color: cookTheme.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 12 }}>
            Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY for Google Maps on mobile.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <GooglePickupMap {...props} />
    </View>
  );
}
