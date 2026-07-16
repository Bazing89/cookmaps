/**
 * Bunny Stream CDN URL helpers.
 * @see https://docs.bunny.net/docs/stream-overview
 */

let cdnHostname = process.env.EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? '';

/** Bunny "Block direct URL" / allowed-domain checks expect an embed player referer. */
const embedReferer =
  process.env.EXPO_PUBLIC_BUNNY_STREAM_EMBED_REFERER ?? 'https://iframe.mediadelivery.net/';

export function setBunnyCdnHostname(hostname: string) {
  cdnHostname = hostname.replace(/^https?:\/\//, '');
}

export function bunnyCdnRequestHeaders(): Record<string, string> {
  const origin = embedReferer.replace(/\/$/, '');
  return { Referer: embedReferer, Origin: origin };
}

export function isBunnyCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith('.b-cdn.net') || host.includes('mediadelivery.net');
  } catch {
    return false;
  }
}

export function getBunnyCdnHostname(): string {
  return cdnHostname;
}

export const isBunnyStreamConfigured = (): boolean => Boolean(cdnHostname);

export function bunnyHlsUrl(videoId: string): string {
  return `https://${cdnHostname}/${videoId}/playlist.m3u8`;
}

export function bunnyThumbnailUrl(videoId: string): string {
  return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
}

export function bunnyPreviewUrl(videoId: string): string {
  return `https://${cdnHostname}/${videoId}/preview.webp`;
}

export function bunnyMp4Url(videoId: string, resolution = '720p'): string {
  return `https://${cdnHostname}/${videoId}/play_${resolution}.mp4`;
}

export type StreamVideoSource = {
  uri: string;
  contentType: 'hls' | 'progressive';
};

export function resolveStreamVideoSource(
  bunnyVideoId?: string | null,
  hlsUrl?: string | null,
  videoUrl?: string | null,
): StreamVideoSource | null {
  if (videoUrl) {
    return {
      uri: videoUrl,
      contentType: videoUrl.includes('.m3u8') ? 'hls' : 'progressive',
    };
  }
  if (bunnyVideoId && cdnHostname) {
    // MP4 is more reliable on native players when Bunny blocks direct CDN URLs —
    // HLS segment requests may not carry custom headers on iOS.
    return { uri: bunnyMp4Url(bunnyVideoId), contentType: 'progressive' };
  }
  if (hlsUrl) {
    return {
      uri: hlsUrl,
      contentType: hlsUrl.includes('.m3u8') ? 'hls' : 'progressive',
    };
  }
  return null;
}

export function resolveStreamVideoUrl(
  bunnyVideoId?: string | null,
  hlsUrl?: string | null,
  videoUrl?: string | null,
): string | null {
  return resolveStreamVideoSource(bunnyVideoId, hlsUrl, videoUrl)?.uri ?? null;
}

export function resolveStreamThumbnail(
  coverImage: string,
  bunnyVideoId?: string | null,
  thumbnailUrl?: string | null,
): string {
  if (thumbnailUrl) return thumbnailUrl;
  if (bunnyVideoId && cdnHostname) return bunnyThumbnailUrl(bunnyVideoId);
  return coverImage;
}
