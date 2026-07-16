import type { LiveStream } from '../types/live';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_MI = 3958.8;

export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 0.1) return '<0.1';
  if (miles < 10) return miles.toFixed(1);
  return Math.round(miles).toString();
}

export function formatDistanceLabel(miles: number, hasUserLocation: boolean): string {
  if (!hasUserLocation) return 'nearby';
  return `${formatDistanceMiles(miles)} mi`;
}

export function applyStreamDistances(
  streams: LiveStream[],
  userLocation: Coordinates | null,
): LiveStream[] {
  if (!userLocation) return streams;

  return streams.map((stream) => ({
    ...stream,
    distanceMiles: distanceMiles(userLocation, {
      latitude: stream.latitude,
      longitude: stream.longitude,
    }),
  }));
}

export function sortStreamsByDistance(streams: LiveStream[]): LiveStream[] {
  return [...streams].sort((a, b) => a.distanceMiles - b.distanceMiles);
}
