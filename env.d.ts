/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    EXPO_PUBLIC_BUNNY_STREAM_API_KEY?: string;
    EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID?: string;
    EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME?: string;
    /** Referer sent with CDN video/thumbnail requests when direct URL access is blocked. */
    EXPO_PUBLIC_BUNNY_STREAM_EMBED_REFERER?: string;
  }
}
