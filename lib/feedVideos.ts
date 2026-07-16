import type { LiveStream } from '../types/live';
import {
  fetchBunnyLibrary,
  fetchBunnyVideos,
  isBunnyApiConfigured,
  resolveLibraryCdnHostname,
} from './bunnyApi';
import { fetchAllCreatorPosts } from './creatorPosts';
import { resolveStreamVideoUrl, setBunnyCdnHostname } from './bunnyStream';
import { geocodeAddress, isGooglePlacesConfigured } from './googlePlaces';

const DEFAULT_COORDS = { latitude: 37.7749, longitude: -122.4194 };

export function streamHasVideo(stream: LiveStream): boolean {
  return resolveStreamVideoUrl(stream.bunnyVideoId, stream.hlsUrl, stream.videoUrl) != null;
}

function usesDefaultCoordinates(stream: LiveStream): boolean {
  return (
    stream.latitude === DEFAULT_COORDS.latitude && stream.longitude === DEFAULT_COORDS.longitude
  );
}

async function enrichStreamLocation(stream: LiveStream): Promise<LiveStream> {
  if (!isGooglePlacesConfigured() || !stream.pickupAddress.trim() || !usesDefaultCoordinates(stream)) {
    return stream;
  }

  const coords = await geocodeAddress(stream.pickupAddress);
  if (!coords) return stream;

  return {
    ...stream,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

async function enrichStreamLocations(streams: LiveStream[]): Promise<LiveStream[]> {
  return Promise.all(streams.map(enrichStreamLocation));
}

async function ensureBunnyCdnHostname(): Promise<void> {
  if (!isBunnyApiConfigured) return;

  try {
    const [library, videos] = await Promise.all([fetchBunnyLibrary(), fetchBunnyVideos()]);
    const cdnHostname = resolveLibraryCdnHostname(library, videos[0]);
    if (cdnHostname) setBunnyCdnHostname(cdnHostname);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn('[feedVideos] Could not resolve Bunny CDN hostname:', message);
  }
}

export async function fetchFeedVideos(): Promise<LiveStream[]> {
  await ensureBunnyCdnHostname();
  const creatorStreams = await fetchAllCreatorPosts();
  return enrichStreamLocations(creatorStreams);
}
