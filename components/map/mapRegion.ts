import type { ClaimedPlate } from '../../screens/cook/types';

const SF_CENTER = { latitude: 37.7749, longitude: -122.4194 };

export type MapCamera = {
  coordinates: { latitude: number; longitude: number };
  zoom: number;
};

export function getMapCamera(plates: ClaimedPlate[]): MapCamera {
  if (plates.length === 0) {
    return { coordinates: SF_CENTER, zoom: 12 };
  }

  if (plates.length === 1) {
    const { latitude, longitude } = plates[0].stream;
    return { coordinates: { latitude, longitude }, zoom: 14 };
  }

  const lats = plates.map((p) => p.stream.latitude);
  const lngs = plates.map((p) => p.stream.longitude);
  const span = Math.max(
    Math.max(...lats) - Math.min(...lats),
    Math.max(...lngs) - Math.min(...lngs),
  );

  return {
    coordinates: {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    },
    zoom: span > 0.08 ? 11 : span > 0.03 ? 12 : 13,
  };
}
