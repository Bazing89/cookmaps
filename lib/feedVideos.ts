import { LIVE_STREAMS } from '../data/lives';
import type { LiveStream } from '../types/live';
import {
  fetchBunnyLibrary,
  fetchBunnyVideos,
  isBunnyApiConfigured,
  metaTagValue,
  resolveLibraryCdnHostname,
  type BunnyVideo,
} from './bunnyApi';
import { resolveStreamVideoUrl, setBunnyCdnHostname } from './bunnyStream';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=200&h=200&fit=crop&crop=faces';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=1800&fit=crop';

function numMeta(tags: BunnyVideo['metaTags'], key: string, fallback: number): number {
  const raw = metaTagValue(tags, key);
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function mapBunnyVideoToLiveStream(video: BunnyVideo): LiveStream {
  const tags = video.metaTags;
  const chefName = metaTagValue(tags, 'chefName') ?? metaTagValue(tags, 'chef_name') ?? 'Home Chef';
  const chefHandle =
    metaTagValue(tags, 'chefHandle') ??
    metaTagValue(tags, 'chef_handle') ??
    `@${chefName.toLowerCase().replace(/\s+/g, '')}`;
  const coverImage = metaTagValue(tags, 'coverImage') ?? DEFAULT_COVER;

  return {
    id: video.guid,
    bunnyVideoId: video.guid,
    hlsUrl: null,
    thumbnailUrl: video.thumbnailUrl ?? null,
    chefName,
    chefHandle,
    chefAvatar: metaTagValue(tags, 'chefAvatar') ?? metaTagValue(tags, 'chef_avatar') ?? DEFAULT_AVATAR,
    dishName: video.title || 'Untitled dish',
    dishDescription:
      video.description?.trim() ||
      metaTagValue(tags, 'dishDescription') ||
      metaTagValue(tags, 'dish_description') ||
      '',
    cuisine: metaTagValue(tags, 'cuisine') ?? 'Home cooking',
    coverImage,
    viewerCount: video.views || numMeta(tags, 'viewerCount', 0),
    likeCount: numMeta(tags, 'likeCount', 0),
    donationGoal: numMeta(tags, 'donationGoal', 100),
    donationRaised: numMeta(tags, 'donationRaised', 0),
    minDonation: numMeta(tags, 'minDonation', 8),
    pickupAddress: metaTagValue(tags, 'pickupAddress') ?? metaTagValue(tags, 'pickup_address') ?? '',
    pickupNeighborhood:
      metaTagValue(tags, 'pickupNeighborhood') ?? metaTagValue(tags, 'pickup_neighborhood') ?? '',
    latitude: numMeta(tags, 'latitude', 37.7749),
    longitude: numMeta(tags, 'longitude', -122.4194),
    distanceMiles: numMeta(tags, 'distanceMiles', 0.5),
    readyInMinutes: numMeta(tags, 'readyInMinutes', 30),
    isLive: metaTagValue(tags, 'isLive') !== 'false',
    tags: metaTagValue(tags, 'tags')?.split(',').map((t) => t.trim()).filter(Boolean) ?? [],
  };
}

export function streamHasVideo(stream: LiveStream): boolean {
  return resolveStreamVideoUrl(stream.bunnyVideoId, stream.hlsUrl) != null;
}

export async function fetchFeedVideos(): Promise<LiveStream[]> {
  if (!isBunnyApiConfigured) {
    console.warn('[feedVideos] Bunny API not configured — using mock feed data');
    return LIVE_STREAMS;
  }

  const [library, videos] = await Promise.all([fetchBunnyLibrary(), fetchBunnyVideos()]);

  const cdnHostname = resolveLibraryCdnHostname(library, videos[0]);
  if (cdnHostname) setBunnyCdnHostname(cdnHostname);

  if (!videos.length) return [];

  return videos.map(mapBunnyVideoToLiveStream);
}
