/**
 * Upload shorts to Bunny Stream (create video + binary PUT + metadata).
 * @see https://docs.bunny.net/stream/http-api
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import {
  bunnyLibraryId,
  fetchBunnyLibrary,
  isBunnyApiConfigured,
  resolveLibraryCdnHostname,
  type BunnyVideoMetaTag,
} from './bunnyApi';
import { bunnyThumbnailUrl, getBunnyCdnHostname, setBunnyCdnHostname } from './bunnyStream';

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';
const apiKey = process.env.EXPO_PUBLIC_BUNNY_STREAM_API_KEY ?? '';

export type BunnyUploadResult = {
  videoId: string;
  thumbnailUrl: string | null;
};

async function ensureCdnHostname(): Promise<void> {
  if (getBunnyCdnHostname()) return;
  const library = await fetchBunnyLibrary();
  const hostname = resolveLibraryCdnHostname(library, null);
  if (hostname) setBunnyCdnHostname(hostname);
}

export async function uploadShortToBunny(input: {
  title: string;
  description?: string;
  fileUri: string;
  metaTags?: BunnyVideoMetaTag[];
}): Promise<BunnyUploadResult> {
  if (!isBunnyApiConfigured) {
    throw new Error(
      'Bunny Stream is not configured. Add EXPO_PUBLIC_BUNNY_STREAM_API_KEY and EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID to .env, then restart Expo.',
    );
  }

  await ensureCdnHostname();

  const createRes = await fetch(`${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: input.title }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    if (createRes.status === 401) {
      throw new Error(
        'Bunny API 401: use your Stream library API key (Stream → library → API), not the account API key.',
      );
    }
    throw new Error(`Could not create Bunny video (${createRes.status}): ${body || createRes.statusText}`);
  }

  const created = (await createRes.json()) as { guid: string; thumbnailUrl?: string | null };
  const videoId = created.guid;
  const uploadUrl = `${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}/videos/${videoId}`;

  if (Platform.OS === 'web') {
    const fileResponse = await fetch(input.fileUri);
    if (!fileResponse.ok) {
      throw new Error('Could not read the selected video file.');
    }
    const blob = await fileResponse.blob();
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        AccessKey: apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
      },
      body: blob,
    });
    if (!uploadRes.ok) {
      const body = await uploadRes.text();
      throw new Error(`Bunny upload failed (${uploadRes.status}): ${body || uploadRes.statusText}`);
    }
  } else {
    const result = await FileSystem.uploadAsync(uploadUrl, input.fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        AccessKey: apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
      },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Bunny upload failed (${result.status}): ${result.body || 'Unknown error'}`);
    }
  }

  const updateRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: input.title,
      description: input.description ?? '',
      metaTags: input.metaTags ?? [],
    }),
  });

  if (!updateRes.ok) {
    console.warn('[bunnyUpload] metadata update failed:', await updateRes.text());
  }

  const thumbnailUrl =
    created.thumbnailUrl ?? (getBunnyCdnHostname() ? bunnyThumbnailUrl(videoId) : null);

  return { videoId, thumbnailUrl };
}

export async function deleteBunnyVideo(videoId: string): Promise<void> {
  if (!isBunnyApiConfigured) return;

  const res = await fetch(`${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: {
      AccessKey: apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Bunny delete failed (${res.status}): ${body || res.statusText}`);
  }
}
