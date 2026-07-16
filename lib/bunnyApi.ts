/**
 * Bunny Stream REST API client — videos + library metadata are the feed "database".
 * @see https://docs.bunny.net/api-reference/stream
 */

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';

const apiKey = process.env.EXPO_PUBLIC_BUNNY_STREAM_API_KEY ?? '';
export const bunnyLibraryId = process.env.EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID ?? '';

export const isBunnyApiConfigured = Boolean(apiKey && bunnyLibraryId);

export type BunnyVideoMetaTag = {
  property: string;
  value: string;
};

export type BunnyVideo = {
  guid: string;
  title: string;
  description?: string | null;
  views: number;
  length: number;
  status: number;
  thumbnailUrl?: string | null;
  metaTags?: BunnyVideoMetaTag[] | null;
};

type BunnyVideoListResponse = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideo[];
};

type BunnyLibrary = {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
  CdnHostname?: string;
  cdnHostname?: string;
  Hostname?: string;
  hostname?: string;
};

async function bunnyFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BUNNY_STREAM_BASE}${path}`, {
    headers: {
      AccessKey: apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) {
      throw new Error(
        'Bunny API 401: invalid Stream credentials. Use the library API key from Stream → your library → API (not the account API key), and ensure EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID matches that library. Restart Expo after updating .env.',
      );
    }
    throw new Error(`Bunny API ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchBunnyLibrary(): Promise<BunnyLibrary | null> {
  if (!isBunnyApiConfigured) return null;
  return bunnyFetch<BunnyLibrary>(`/library/${bunnyLibraryId}`);
}

export async function fetchBunnyVideos(page = 1, itemsPerPage = 100): Promise<BunnyVideo[]> {
  if (!isBunnyApiConfigured) return [];

  const data = await bunnyFetch<BunnyVideoListResponse>(
    `/library/${bunnyLibraryId}/videos?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`,
  );

  return (data.items ?? []).filter((v) => v.status === 4 || v.status === 3);
}

export function resolveLibraryCdnHostname(
  library: BunnyLibrary | null,
  sampleVideo?: BunnyVideo | null,
): string | null {
  const fromLibrary =
    library?.CdnHostname ??
    library?.cdnHostname ??
    library?.Hostname ??
    library?.hostname ??
    null;

  if (fromLibrary) return fromLibrary.replace(/^https?:\/\//, '');

  const thumb = sampleVideo?.thumbnailUrl;
  if (thumb) {
    try {
      return new URL(thumb).hostname;
    } catch {
      return null;
    }
  }

  return null;
}

export function metaTagValue(
  tags: BunnyVideoMetaTag[] | null | undefined,
  property: string,
): string | undefined {
  return tags?.find((t) => t.property === property)?.value;
}
