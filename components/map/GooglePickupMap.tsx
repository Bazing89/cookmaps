import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { cookTheme } from '../../theme/cookTheme';
import { ChefMapPin } from './ChefMapPin';
import { getMapCamera } from './mapRegion';
import type { PickupMapProps } from './types';

function zoomToLatitudeDelta(zoom: number): number {
  return 360 / Math.pow(2, zoom + 1);
}

export function GooglePickupMap({ chefs, plates, userLocation }: PickupMapProps) {
  const { coordinates, zoom } = getMapCamera(chefs, plates, userLocation);
  const delta = zoomToLatitudeDelta(zoom);

  const initialRegion = useMemo(
    () => ({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta * 1.4,
    }),
    [coordinates.latitude, coordinates.longitude, delta],
  );

  const mapKey = `${chefs.map((c) => c.id).join('|')}|${plates.map((p) => p.id).join('|')}`;

  const plateByStreamId = useMemo(
    () => new Map(plates.map((plate) => [plate.stream.id, plate])),
    [plates],
  );

  return (
    <MapView
      key={mapKey}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      scrollEnabled
      zoomEnabled
      zoomControlEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      mapType="standard"
      userInterfaceStyle="dark"
    >
      {chefs.map((chef) => {
        const plate = plateByStreamId.get(chef.id);
        return (
          <Marker
            key={chef.id}
            coordinate={{
              latitude: chef.latitude,
              longitude: chef.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <ChefMapPin avatarUri={chef.chefAvatar} amount={plate?.amount} />
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: cookTheme.bg,
  },
});
