import { Platform, useWindowDimensions } from 'react-native';

export const WEB_DESKTOP_BREAKPOINT = 992;

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= WEB_DESKTOP_BREAKPOINT;

  const videoHeight = isDesktop ? Math.min(height - 32, 780) : height;
  const videoWidth = isDesktop ? Math.round((videoHeight * 9) / 16) : width;

  return { isWeb, isDesktop, width, height, videoHeight, videoWidth };
}
