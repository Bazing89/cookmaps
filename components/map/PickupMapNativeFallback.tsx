import { StyleSheet, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import { ChefMapPin } from './ChefMapPin';
import { getMapCamera } from './mapRegion';
import type { PickupMapProps } from './types';

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

export function PickupMapNativeFallback({ chefs, plates, userLocation }: PickupMapProps) {
  const center = getMapCamera(chefs, plates, userLocation).coordinates;
  const plateByStreamId = new Map(plates.map((plate) => [plate.stream.id, plate]));

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

      {chefs.map((chef) => {
        const plate = plateByStreamId.get(chef.id);
        const pos = pinPosition(chef.latitude, chef.longitude, center);
        return (
          <View key={chef.id} style={[styles.pin, pos]}>
            <ChefMapPin avatarUri={chef.chefAvatar} amount={plate?.amount} />
          </View>
        );
      })}

      {userLocation ? (
        <View style={[styles.userPin, pinPosition(userLocation.latitude, userLocation.longitude, center)]}>
          <View style={styles.userDot} />
        </View>
      ) : null}

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Google Maps requires a dev build. Run `npx expo run:ios` or `npx expo run:android`.
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
  userPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
  },
  banner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: cookTheme.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    color: cookTheme.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
