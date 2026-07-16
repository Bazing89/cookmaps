import type { Coordinates } from './geo';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

type GeocodeResponse = {
  status: string;
  results?: {
    geometry: { location: { lat: number; lng: number } };
    formatted_address?: string;
    address_components?: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
  }[];
  error_message?: string;
};

export function isGooglePlacesConfigured(): boolean {
  return Boolean(API_KEY);
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!API_KEY || !address.trim()) return null;

  const url = `${GEOCODE_BASE}?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as GeocodeResponse;
  if (data.status !== 'OK' || !data.results?.[0]) {
    console.warn('[googlePlaces] geocode failed:', data.status, data.error_message);
    return null;
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { latitude: lat, longitude: lng };
}

export async function reverseGeocodeNeighborhood(coords: Coordinates): Promise<string | null> {
  if (!API_KEY) return null;

  const url = `${GEOCODE_BASE}?latlng=${coords.latitude},${coords.longitude}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as GeocodeResponse;
  const components = data.results?.[0]?.address_components;
  if (!components) return null;

  const neighborhood =
    components.find((c) => c.types.includes('neighborhood')) ??
    components.find((c) => c.types.includes('sublocality')) ??
    components.find((c) => c.types.includes('locality'));

  return neighborhood?.long_name ?? null;
}
