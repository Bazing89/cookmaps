import { supabase } from './supabase';

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
