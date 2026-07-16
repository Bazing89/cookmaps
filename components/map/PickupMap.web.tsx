import { AdvancedMarker, APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { cookTheme } from '../../theme/cookTheme';
import { ChefMapPin } from './ChefMapPin';
import { getMapCamera } from './mapRegion';
import type { PickupMapProps } from './types';

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function UserLocationPin() {
  return (
    <View style={styles.userPinOuter}>
      <View style={styles.userPinInner} />
    </View>
  );
}

export function PickupMap({ chefs, plates, userLocation }: PickupMapProps) {
  const { coordinates, zoom } = getMapCamera(chefs, plates, userLocation);

  const plateByStreamId = useMemo(
    () => new Map(plates.map((plate) => [plate.stream.id, plate])),
    [plates],
  );

  if (!apiKey) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <Text style={styles.fallbackText}>Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map on web.</Text>
      </View>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
        style={styles.map}
        defaultCenter={{ lat: coordinates.latitude, lng: coordinates.longitude }}
        defaultZoom={zoom}
        mapId="DEMO_MAP_ID"
        colorScheme="DARK"
        disableDefaultUI
        gestureHandling="greedy"
        zoomControl={false}
        fullscreenControl={false}
      >
        {chefs.map((chef) => {
          const plate = plateByStreamId.get(chef.id);
          return (
            <AdvancedMarker
              key={chef.id}
              position={{
                lat: chef.latitude,
                lng: chef.longitude,
              }}
            >
              <ChefMapPin avatarUri={chef.chefAvatar} amount={plate?.amount} />
            </AdvancedMarker>
          );
        })}
        {userLocation ? (
          <AdvancedMarker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="You"
          >
            <UserLocationPin />
          </AdvancedMarker>
        ) : null}
      </GoogleMap>
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
  userPinOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  userPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
});
