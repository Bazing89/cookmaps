import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, StyleSheet } from 'react-native';
import type { ClaimedPlate } from '../../screens/cook/types';
import { cookTheme } from '../../theme/cookTheme';
import { getMapCamera } from './mapRegion';

type Props = {
  plates: ClaimedPlate[];
};

export function ExpoMapsPickupMap({ plates }: Props) {
  const cameraPosition = getMapCamera(plates);
  const markers = plates.map((plate) => ({
    id: plate.id,
    coordinates: {
      latitude: plate.stream.latitude,
      longitude: plate.stream.longitude,
    },
    title: `${plate.stream.chefName} · $${plate.amount}`,
  }));

  if (Platform.OS === 'ios') {
    return (
      <AppleMaps.View
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
        properties={{ selectionEnabled: true }}
      />
    );
  }

  return (
    <GoogleMaps.View
      style={styles.map}
      cameraPosition={cameraPosition}
      markers={markers}
      colorScheme={GoogleMaps.MapColorScheme.DARK}
      properties={{ mapType: GoogleMaps.MapType.NORMAL }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: cookTheme.bg,
  },
});
