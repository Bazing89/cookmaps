import Storage from 'expo-sqlite/kv-store';
import type { SupportedStorage } from '@supabase/supabase-js';

export const AUTH_STORAGE_KEY = 'cookmapz-auth';

/** SQLite-backed key-value store for native (AsyncStorage-compatible API). */
export const authStorage: SupportedStorage = Storage;
