import type { SupportedStorage } from '@supabase/supabase-js';

export const AUTH_STORAGE_KEY = 'cookmapz-auth';

/** Browser localStorage — avoids expo-sqlite WASM on web. */
export const authStorage: SupportedStorage = {
  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore quota / private mode errors
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
