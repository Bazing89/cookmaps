import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'CookMapz',
  slug: 'cookmapz',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'cookmapz',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0B0C',
  },
  ios: {
    supportsTablet: true,
    buildNumber: '1',
    bundleIdentifier: 'com.cookmapz.app',
    config: {
      googleMapsApiKey,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'CookMapz uses your location to show nearby chefs, pickup distances, and your position on the map.',
    },
  },
  android: {
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0B0C',
    },
    package: 'com.cookmapz.app',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    'expo-dev-client',
    'expo-sqlite',
      [
      'expo-image-picker',
      {
        photosPermission: 'Allow CookMapz to access your photos for profile pictures and cooking shorts.',
      },
    ],
    'expo-system-ui',
    'expo-font',
    'expo-video',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow CookMapz to show nearby chefs, pickup distances, and your position on the map.',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '94eefcf2-2928-402e-9ebd-ca8b46e26453',
    },
  },
};

export default config;
