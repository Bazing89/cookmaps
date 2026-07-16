import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ClaimedPlate } from '../../screens/cook/types';
import { cookTheme } from '../../theme/cookTheme';
import { getMapCamera } from './mapRegion';

type Props = {
  plates: ClaimedPlate[];
};

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function ChefPin({ plate }: { plate: ClaimedPlate }) {
  return (
    <View style={styles.pin}>
      <View style={styles.avatarRing}>
        <Image source={{ uri: plate.stream.chefAvatar }} style={styles.avatar} />
      </View>
      <View style={styles.amountBadge}>
        <Text style={styles.amountText}>${plate.amount}</Text>
      </View>
    </View>
  );
}

export function PickupMap({ plates }: Props) {
  const { coordinates, zoom } = getMapCamera(plates);

  if (!apiKey) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <Text style={styles.fallbackText}>Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map on web.</Text>
      </View>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={styles.map}
        defaultCenter={{ lat: coordinates.latitude, lng: coordinates.longitude }}
        defaultZoom={zoom}
        mapId="DEMO_MAP_ID"
        colorScheme="DARK"
        disableDefaultUI
        gestureHandling="greedy"
      >
        {plates.map((plate) => (
          <AdvancedMarker
            key={plate.id}
            position={{
              lat: plate.stream.latitude,
              lng: plate.stream.longitude,
            }}
          >
            <ChefPin plate={plate} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#14181C',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fallbackText: {
    color: cookTheme.textMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  pin: {
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
});
