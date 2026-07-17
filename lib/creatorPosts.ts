import type { LiveStream, TicketOffering } from '../types/live';
import type {
  CreatePlateInput,
  CreatePostInput,
  CreatorPlate,
  CreatorPost,
  CreatorProfile,
  PostPlateLinkRow,
  PostPlateRow,
} from '../types/creator';
import { isBunnyApiConfigured } from './bunnyApi';
import { deleteBunnyVideo } from './bunnyUpload';
import { bunnyThumbnailUrl, ensureBunnyCdnHostname, getBunnyCdnHostname } from './bunnyStream';
import { supabase } from './supabase';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=1800&fit=crop';

const POST_SELECT =
  '*, profiles(*), post_plates(*), post_plate_links(sort_order, creator_plates(*))';

type ResolvedPlate = {
  id: string;
  label: string;
  description: string;
  ingredients?: string;
  price: number;
  quantity?: number | null;
  imageUrl?: string | null;
  sort_order: number;
};

export function displayHandle(profile: Pick<CreatorProfile, 'handle' | 'display_name'>): string {
  if (profile.handle) return profile.handle.startsWith('@') ? profile.handle : `@${profile.handle}`;
  const name = profile.display_name ?? 'chef';
  return `@${name.toLowerCase().replace(/\s+/g, '')}`;
}

export function applyCreatorProfileToStream(
  stream: LiveStream,
  profile: Pick<CreatorProfile, 'id' | 'display_name' | 'handle' | 'avatar_url'>,
): LiveStream {
  if (stream.creatorId && stream.creatorId !== profile.id) return stream;

  return {
    ...stream,
    creatorId: profile.id,
    chefName: profile.display_name ?? stream.chefName,
    chefHandle: displayHandle(profile),
    chefAvatar: profile.avatar_url?.trim() ?? '',
  };
}

function resolvePlatesFromPost(row: {
  post_plate_links?: PostPlateLinkRow[];
  post_plates?: PostPlateRow[];
}): ResolvedPlate[] {
  const links = row.post_plate_links ?? [];
  if (links.length) {
    return [...links]
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((link) => link.creator_plates)
      .map((link) => {
        const plate = link.creator_plates as CreatorPlate;
        return {
          id: plate.id,
          label: plate.name,
          description: plate.description ?? '',
          ingredients: plate.ingredients ?? '',
          price: Number(plate.price),
          imageUrl: plate.image_url,
          sort_order: link.sort_order,
        };
      });
  }

  return [...(row.post_plates ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((plate) => ({
      id: plate.id,
      label: plate.label,
      description: plate.description ?? '',
      price: Number(plate.price),
      quantity: plate.quantity,
      imageUrl: plate.image_url,
      sort_order: plate.sort_order,
    }));
}

function mapResolvedPlatesToOfferings(plates: ResolvedPlate[]): TicketOffering[] {
  return plates.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    ingredients: p.ingredients,
    price: p.price,
    quantity: p.quantity,
    imageUrl: p.imageUrl ?? null,
  }));
}

export function mapPostToLiveStream(
  post: CreatorPost,
  profile: CreatorProfile,
  plateSource?: { post_plate_links?: PostPlateLinkRow[]; post_plates?: PostPlateRow[] },
): LiveStream {
  const chefName = profile.display_name ?? 'Home Chef';
  const chefHandle = displayHandle(profile);
  const resolvedPlates = plateSource ? resolvePlatesFromPost(plateSource) : [];

  return {
    id: post.id,
    creatorId: profile.id,
    postType: post.post_type,
    bunnyVideoId: post.bunny_video_id,
    hlsUrl:
      post.post_type === 'live' && post.video_url?.includes('.m3u8')
        ? post.video_url
        : null,
    videoUrl: post.video_url,
    thumbnailUrl: post.thumbnail_url,
    chefName,
    chefHandle,
    chefAvatar: profile.avatar_url?.trim() ?? '',
    dishName: post.title,
    dishDescription: post.description ?? '',
    cuisine: post.cuisine ?? 'Home cooking',
    coverImage:
      post.thumbnail_url?.trim() ||
      (post.bunny_video_id && getBunnyCdnHostname()
        ? bunnyThumbnailUrl(post.bunny_video_id)
        : null) ||
      post.cover_image?.trim() ||
      DEFAULT_COVER,
    viewerCount: post.viewer_count,
    likeCount: post.like_count,
    donationGoal: Number(post.donation_goal),
    donationRaised: Number(post.donation_raised),
    minDonation: Number(post.min_donation),
    pickupAddress: post.pickup_address ?? '',
    pickupNeighborhood: post.pickup_neighborhood ?? '',
    latitude: post.latitude,
    longitude: post.longitude,
    distanceMiles: 0.5,
    readyInMinutes: post.ready_in_minutes,
    isLive: post.is_live && post.status === 'live',
    tags: post.tags ?? [],
    ticketPrice: Number(post.min_donation),
    tickets: mapResolvedPlatesToOfferings(resolvedPlates),
    plates: mapResolvedPlatesToOfferings(resolvedPlates),
  };
}

type PostWithRelations = CreatorPost & {
  profiles: CreatorProfile;
  post_plates?: PostPlateRow[];
  post_plate_links?: PostPlateLinkRow[];
};

function mapPostRow(row: PostWithRelations): LiveStream {
  return mapPostToLiveStream(row, row.profiles, row);
}

export async function fetchAllCreatorPosts(): Promise<LiveStream[]> {
  await ensureBunnyCdnHostname();

  const { data, error } = await supabase
    .from('creator_posts')
    .select(POST_SELECT)
    .in('status', ['published', 'live', 'processing'])
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[creatorPosts] fetchAll failed:', error.message);
    return [];
  }

  return ((data ?? []) as PostWithRelations[])
    .filter((row) => Boolean(row.creator_id && row.profiles))
    .map((row) => mapPostRow(row));
}

export async function fetchCreatorProfile(creatorId: string): Promise<CreatorProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', creatorId).maybeSingle();
  if (error || !data) return null;
  return data as CreatorProfile;
}

export async function fetchPostsByCreator(creatorId: string): Promise<LiveStream[]> {
  await ensureBunnyCdnHostname();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', creatorId)
    .maybeSingle();

  if (profileError || !profile) return [];

  const { data, error } = await supabase
    .from('creator_posts')
    .select(`*, post_plates(*), post_plate_links(sort_order, creator_plates(*))`)
    .eq('creator_id', creatorId)
    .in('status', ['published', 'live', 'processing', 'ended'])
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[creatorPosts] fetchByCreator failed:', error.message);
    return [];
  }

  return (data ?? []).map((post) =>
    mapPostToLiveStream(post as CreatorPost, profile as CreatorProfile, post as PostWithRelations),
  );
}

export async function createCreatorPost(
  creatorId: string,
  input: CreatePostInput,
): Promise<CreatorPost | null> {
  const { data, error } = await supabase
    .from('creator_posts')
    .insert({
      creator_id: creatorId,
      post_type: input.post_type,
      title: input.title,
      description: input.description ?? null,
      cuisine: input.cuisine ?? 'Home cooking',
      video_url: input.video_url ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      cover_image: input.cover_image ?? null,
      bunny_video_id: input.bunny_video_id ?? null,
      is_live: input.is_live ?? input.post_type === 'live',
      donation_goal: input.donation_goal ?? 100,
      min_donation: input.min_donation ?? 8,
      pickup_address: input.pickup_address ?? '',
      pickup_neighborhood: input.pickup_neighborhood ?? '',
      ready_in_minutes: input.ready_in_minutes ?? 30,
      tags: input.tags ?? [],
      status: input.status ?? (input.post_type === 'live' ? 'live' : 'published'),
      stream_key: input.stream_key ?? null,
      rtmp_url: input.rtmp_url ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from('profiles').update({ role: 'chef' }).eq('id', creatorId);

  return data as CreatorPost;
}

/** @deprecated Use linkPlatesToPost from lib/plates for catalog plates. */
export async function createPlatesForPost(postId: string, plates: CreatePlateInput[]): Promise<void> {
  if (!plates.length) return;

  const rows = plates.map((plate, index) => ({
    post_id: postId,
    label: plate.label,
    description: plate.description ?? '',
    price: plate.price,
    quantity: plate.quantity ?? null,
    sort_order: plate.sort_order ?? index,
    image_url: plate.image_url ?? null,
  }));

  const { error } = await supabase.from('post_plates').insert(rows);
  if (error) throw new Error(error.message);
}

export async function endLivePost(
  postId: string,
  creatorId: string,
  options?: { bunnyLiveStreamId?: string | null },
): Promise<void> {
  if (options?.bunnyLiveStreamId) {
    try {
      const { stopBunnyLiveStream } = await import('./bunnyLive');
      await stopBunnyLiveStream(options.bunnyLiveStreamId);
    } catch (e) {
      console.warn('[creatorPosts] Bunny live stop failed:', e);
    }
  }

  const { error } = await supabase
    .from('creator_posts')
    .update({ is_live: false, status: 'ended' })
    .eq('id', postId)
    .eq('creator_id', creatorId);

  if (error) throw new Error(error.message);
}

export async function deleteCreatorPost(
  postId: string,
  creatorId: string,
  options?: { bunnyVideoId?: string | null; videoUrl?: string | null },
): Promise<void> {
  if (options?.bunnyVideoId && isBunnyApiConfigured) {
    try {
      await deleteBunnyVideo(options.bunnyVideoId);
    } catch (e) {
      console.warn('[creatorPosts] Bunny delete failed:', e);
    }
  }

  if (options?.videoUrl?.includes('/creator-videos/')) {
    const marker = '/creator-videos/';
    const pathStart = options.videoUrl.indexOf(marker);
    if (pathStart >= 0) {
      const storagePath = options.videoUrl.slice(pathStart + marker.length).split('?')[0];
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('creator-videos').remove([storagePath]);
        if (storageError) {
          console.warn('[creatorPosts] storage delete failed:', storageError.message);
        }
      }
    }
  }

  const platePrefix = `${creatorId}/${postId}`;
  const { data: plateFiles } = await supabase.storage.from('plate-images').list(platePrefix);
  if (plateFiles?.length) {
    const platePaths = plateFiles.map((file) => `${platePrefix}/${file.name}`);
    const { error: plateStorageError } = await supabase.storage.from('plate-images').remove(platePaths);
    if (plateStorageError) {
      console.warn('[creatorPosts] plate image delete failed:', plateStorageError.message);
    }
  }

  const { data, error } = await supabase
    .from('creator_posts')
    .delete()
    .eq('id', postId)
    .eq('creator_id', creatorId)
    .select('id');

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error('Post not found or you do not have permission to delete it.');
  }
}

export async function uploadCreatorVideo(
  creatorId: string,
  postId: string,
  fileUri: string,
  mimeType = 'video/mp4',
): Promise<string> {
  const ext = mimeType.includes('quicktime') ? 'mov' : mimeType.includes('webm') ? 'webm' : 'mp4';
  const path = `${creatorId}/${postId}.${ext}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('creator-videos')
    .upload(path, blob, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('creator-videos').getPublicUrl(path);
  return data.publicUrl;
}

export function creatorKeyForStream(stream: LiveStream): string {
  return stream.creatorId ?? stream.chefHandle;
}
