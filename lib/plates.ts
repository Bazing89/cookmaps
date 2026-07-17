import type { CreateCreatorPlateInput, CreatorPlate } from '../types/creator';
import type { LiveStream, TicketOffering } from '../types/live';
import { fetchAllCreatorPosts } from './creatorPosts';
import { ensureBunnyCdnHostname } from './bunnyStream';
import { supabase } from './supabase';

export type NearbyPlateListing = {
  plateId: string;
  label: string;
  description: string;
  ingredients?: string;
  price: number;
  imageUrl: string | null;
  stream: LiveStream;
};

export function plateListingsFromStreams(streams: LiveStream[]): NearbyPlateListing[] {
  const listings: NearbyPlateListing[] = [];

  for (const stream of streams) {
    for (const plate of stream.plates ?? []) {
      listings.push({
        plateId: plate.id,
        label: plate.label,
        description: plate.description,
        ingredients: plate.ingredients,
        price: plate.price,
        imageUrl: plate.imageUrl ?? null,
        stream,
      });
    }
  }

  return listings.sort((a, b) => a.stream.distanceMiles - b.stream.distanceMiles);
}

export async function fetchAvailablePlateListings(): Promise<NearbyPlateListing[]> {
  await ensureBunnyCdnHostname();
  const streams = await fetchAllCreatorPosts();
  return plateListingsFromStreams(streams);
}

export async function uploadCreatorPlateImage(
  userId: string,
  plateId: string,
  fileUri: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const path = `${userId}/catalog/${plateId}.${ext}`;

  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error('Could not read the selected plate photo.');
  }
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('plate-images')
    .upload(path, blob, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('plate-images').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

/** @deprecated Legacy post-attached uploads — use uploadCreatorPlateImage for catalog plates. */
export async function uploadPlateImage(
  userId: string,
  postId: string,
  plateKey: string,
  fileUri: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const path = `${userId}/${postId}/${plateKey}.${ext}`;

  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error('Could not read the selected plate photo.');
  }
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('plate-images')
    .upload(path, blob, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('plate-images').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function fetchCreatorPlates(creatorId: string): Promise<CreatorPlate[]> {
  const { data, error } = await supabase
    .from('creator_plates')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[plates] fetchCreatorPlates failed:', error.message);
    return [];
  }

  return (data ?? []) as CreatorPlate[];
}

export async function createCreatorPlate(
  creatorId: string,
  input: CreateCreatorPlateInput,
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<CreatorPlate> {
  const plateId = crypto.randomUUID();

  const imageUrl = await uploadCreatorPlateImage(creatorId, plateId, imageUri, mimeType);

  const { data, error } = await supabase
    .from('creator_plates')
    .insert({
      id: plateId,
      creator_id: creatorId,
      name: input.name.trim(),
      ingredients: input.ingredients.trim(),
      description: input.description.trim(),
      price: input.price,
      image_url: imageUrl,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as CreatorPlate;
}

export async function deleteCreatorPlate(creatorId: string, plateId: string): Promise<void> {
  const { data: catalogFiles } = await supabase.storage.from('plate-images').list(`${creatorId}/catalog`);
  if (catalogFiles?.length) {
    const paths = catalogFiles
      .filter((file) => file.name.startsWith(plateId))
      .map((file) => `${creatorId}/catalog/${file.name}`);
    if (paths.length) {
      await supabase.storage.from('plate-images').remove(paths);
    }
  }

  const { data, error } = await supabase
    .from('creator_plates')
    .delete()
    .eq('id', plateId)
    .eq('creator_id', creatorId)
    .select('id');

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error('Plate not found or you do not have permission to delete it.');
  }
}

export async function linkPlatesToPost(postId: string, plateIds: string[]): Promise<void> {
  if (!plateIds.length) return;

  const rows = plateIds.map((creator_plate_id, index) => ({
    post_id: postId,
    creator_plate_id,
    sort_order: index,
  }));

  const { error } = await supabase.from('post_plate_links').insert(rows);
  if (error) throw new Error(error.message);
}

export function creatorPlateToOffering(plate: CreatorPlate): TicketOffering {
  return {
    id: plate.id,
    label: plate.name,
    description: plate.description,
    ingredients: plate.ingredients,
    price: Number(plate.price),
    imageUrl: plate.image_url,
  };
}
