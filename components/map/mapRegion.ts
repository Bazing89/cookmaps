import type { Coordinates } from '../../lib/geo';
import type { ClaimedPlate } from '../../screens/cook/types';
import type { LiveStream } from '../../types/live';

const SF_CENTER: Coordinates = { latitude: 37.7749, longitude: -122.4194 };

export type MapCamera = {
  coordinates: Coordinates;
  zoom: number;
};

function collectPoints(
  chefs: LiveStream[],
  plates: ClaimedPlate[],
  userLocation?: Coordinates | null,
): Coordinates[] {
  const points = chefs.map((chef) => ({
    latitude: chef.latitude,
    longitude: chef.longitude,
  }));

  for (const plate of plates) {
    points.push({
      latitude: plate.stream.latitude,
      longitude: plate.stream.longitude,
    });
  }

  if (userLocation) points.push(userLocation);
  return points;
}

export function getMapCamera(
  chefs: LiveStream[],
  plates: ClaimedPlate[],
  userLocation?: Coordinates | null,
): MapCamera {
  const points = collectPoints(chefs, plates, userLocation);

  if (points.length === 0) {
    return { coordinates: userLocation ?? SF_CENTER, zoom: userLocation ? 13 : 12 };
  }

  if (points.length === 1) {
    return { coordinates: points[0], zoom: 14 };
  }

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
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
