/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    EXPO_PUBLIC_BUNNY_STREAM_API_KEY?: string;
    EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID?: string;
    EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME?: string;
    EXPO_PUBLIC_BUNNY_LIVE_API_KEY?: string;
    EXPO_PUBLIC_BUNNY_LIVE_LIBRARY_ID?: string;
    EXPO_PUBLIC_BUNNY_LIVE_CDN_HOSTNAME?: string;
    EXPO_PUBLIC_BUNNY_LIVE_RTMP_URL?: string;
    /** Referer sent with CDN video/thumbnail requests when direct URL access is blocked. */
    EXPO_PUBLIC_BUNNY_STREAM_EMBED_REFERER?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}
