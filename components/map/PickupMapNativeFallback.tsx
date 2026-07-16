import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ClaimedPlate } from '../../screens/cook/types';
import { cookTheme } from '../../theme/cookTheme';
import { getMapCamera } from './mapRegion';

type Props = {
  plates: ClaimedPlate[];
};

function pinPosition(
  latitude: number,
  longitude: number,
  center: { latitude: number; longitude: number },
) {
  const latSpan = 0.12;
  const lngSpan = 0.18;
  const top = 50 - ((latitude - center.latitude) / latSpan) * 40;
  const left = 50 + ((longitude - center.longitude) / lngSpan) * 40;
  return {
    top: `${Math.min(82, Math.max(18, top))}%` as `${number}%`,
    left: `${Math.min(82, Math.max(18, left))}%` as `${number}%`,
  };
}

export function PickupMapNativeFallback({ plates }: Props) {
  const center = getMapCamera(plates).coordinates;

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 11}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 14}%` }]} />
        ))}
      </View>

      {plates.map((plate) => {
        const pos = pinPosition(plate.stream.latitude, plate.stream.longitude, center);
        return (
          <View key={plate.id} style={[styles.pin, pos]}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: plate.stream.chefAvatar }} style={styles.avatar} />
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountText}>${plate.amount}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={16} color={cookTheme.accentSoft} />
        <Text style={styles.bannerText}>
          Native maps need a dev build. Use `npx expo run:ios` or an EAS build — Expo Go does not
          include expo-maps.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#14181C',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  avatarRing: {
    borderColor: '#fff',
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    height: 44,
    width: 44,
  },
  amountBadge: {
    backgroundColor: cookTheme.accent,
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  amountText: {
    color: '#fff',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
  },
  banner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: cookTheme.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    flex: 1,
    color: cookTheme.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
});
