import type { Profile } from '../types/database';
import { supabase } from './supabase';

export type ProfileUpdateInput = {
  display_name?: string;
  handle?: string;
  avatar_url?: string | null;
  bio?: string | null;
};

export function normalizeHandle(raw: string): string {
  return raw.replace(/^@/, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export function isProfileSetupIncomplete(profile: Profile | null): boolean {
  if (!profile) return true;
  return !profile.avatar_url?.trim();
}

export function profileInitial(
  displayName?: string | null,
  email?: string | null,
): string {
  const source = displayName?.trim() || email?.trim() || '?';
  return source.charAt(0).toUpperCase();
}

export async function uploadProfileAvatar(
  userId: string,
  fileUri: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error('Could not read the selected image.');
  }
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType: mimeType, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput): Promise<Profile> {
  const payload: {
    display_name?: string | null;
    handle?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } = {};

  if (input.display_name !== undefined) {
    payload.display_name = input.display_name.trim() || null;
  }
  if (input.handle !== undefined) {
    const handle = normalizeHandle(input.handle);
    payload.handle = handle || null;
  }
  if (input.avatar_url !== undefined) {
    payload.avatar_url = input.avatar_url;
  }
  if (input.bio !== undefined) {
    payload.bio = input.bio?.trim() || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('That handle is already taken. Try another.');
    }
    throw new Error(error.message);
  }

  return data as Profile;
}
