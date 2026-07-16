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
    bundleIdentifier: 'com.cookmapz.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
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
    'expo-system-ui',
    'expo-font',
    'expo-video',
    [
      'expo-maps',
      {
        requestLocationPermission: true,
        locationPermission: 'Allow CookMapz to show your location on the pickup map.',
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
