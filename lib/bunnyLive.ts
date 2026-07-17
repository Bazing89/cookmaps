/**
 * Bunny Stream Live API — create RTMP ingest + HLS playback for ticketed live cooks.
 * @see https://docs.bunny.net/api-reference/stream
 */

import { ensureBunnyCdnHostname } from './bunnyStream';

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';
const apiKey =
  process.env.EXPO_PUBLIC_BUNNY_LIVE_API_KEY?.trim() ||
  process.env.EXPO_PUBLIC_BUNNY_STREAM_API_KEY?.trim() ||
  '';

/** Library 706984 — dedicated live streaming library. */
export const bunnyLiveLibraryId =
  process.env.EXPO_PUBLIC_BUNNY_LIVE_LIBRARY_ID?.trim() || '706984';

export const bunnyLiveCdnHostname =
  process.env.EXPO_PUBLIC_BUNNY_LIVE_CDN_HOSTNAME?.trim().replace(/^https?:\/\//, '') ||
  '';

export const isBunnyLiveConfigured = Boolean(apiKey && bunnyLiveLibraryId);

/** Default Bunny RTMP ingest server (stream key goes in OBS "Stream key" field). */
export const BUNNY_LIVE_RTMP_SERVER =
  process.env.EXPO_PUBLIC_BUNNY_LIVE_RTMP_URL?.trim() || 'rtmp://live.bunnycdn.com/live';

export type BunnyLiveStream = {
  guid: string;
  title: string;
  streamKey: string;
  playbackUrlHls: string;
  rtmpServer: string;
  ingestRegion?: string;
  thumbnailUrl?: string | null;
};

type BunnyLiveApiResponse = {
  guid?: string;
  title?: string;
  streamKey?: string;
  playbackUrlHls?: string;
  ingestRegion?: string;
  thumbnailUrl?: string | null;
  thumbnailFileName?: string | null;
};

function liveHeaders(): Record<string, string> {
  return {
    AccessKey: apiKey,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function liveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BUNNY_STREAM_BASE}${path}`, {
    ...init,
    headers: { ...liveHeaders(), ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) {
      throw new Error(
        `Bunny Live API 401: use EXPO_PUBLIC_BUNNY_LIVE_API_KEY for library ${bunnyLiveLibraryId} (Stream → library → API).`,
      );
    }
    throw new Error(`Bunny Live API ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

function mapLiveResponse(raw: BunnyLiveApiResponse, title: string): BunnyLiveStream {
  const guid = raw.guid?.trim();
  const streamKey = raw.streamKey?.trim();
  const playbackUrlHls = raw.playbackUrlHls?.trim();

  if (!guid || !streamKey || !playbackUrlHls) {
    throw new Error('Bunny Live API returned an incomplete live stream response.');
  }

  return {
    guid,
    title: raw.title?.trim() || title,
    streamKey,
    playbackUrlHls,
    rtmpServer: BUNNY_LIVE_RTMP_SERVER,
    ingestRegion: raw.ingestRegion,
    thumbnailUrl: raw.thumbnailUrl ?? null,
  };
}

export async function createBunnyLiveStream(input: {
  title: string;
  description?: string;
}): Promise<BunnyLiveStream> {
  if (!isBunnyLiveConfigured) {
    throw new Error(
      'Bunny Live is not configured. Add EXPO_PUBLIC_BUNNY_LIVE_API_KEY and EXPO_PUBLIC_BUNNY_LIVE_LIBRARY_ID to .env, then restart Expo.',
    );
  }

  await ensureBunnyCdnHostname();

  const raw = await liveFetch<BunnyLiveApiResponse>(
    `/library/${bunnyLiveLibraryId}/live`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: input.title,
        description: input.description ?? '',
        public: false,
        dvrEnabled: true,
        dvrWindowSeconds: 7200,
        recordVod: true,
      }),
    },
  );

  return mapLiveResponse(raw, input.title);
}

/** Mark the live stream as started so ticket holders can watch HLS playback. */
export async function startBunnyLiveStream(streamId: string): Promise<BunnyLiveStream> {
  if (!isBunnyLiveConfigured) {
    throw new Error('Bunny Live is not configured.');
  }

  const raw = await liveFetch<BunnyLiveApiResponse>(
    `/library/${bunnyLiveLibraryId}/live/${streamId}/start`,
    { method: 'POST' },
  );

  return mapLiveResponse(raw, raw.title ?? 'Live');
}

/** Stop publishing and optionally save VOD when recordVod was enabled. */
export async function stopBunnyLiveStream(streamId: string): Promise<void> {
  if (!isBunnyLiveConfigured) return;

  await liveFetch<BunnyLiveApiResponse>(
    `/library/${bunnyLiveLibraryId}/live/${streamId}/stop`,
    { method: 'PUT' },
  );
}

export async function deleteBunnyLiveStream(streamId: string): Promise<void> {
  if (!isBunnyLiveConfigured) return;

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${bunnyLiveLibraryId}/live/${streamId}`,
    {
      method: 'DELETE',
      headers: liveHeaders(),
    },
  );

  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Bunny Live delete failed (${res.status}): ${body || res.statusText}`);
  }
}
