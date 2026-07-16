import { Platform, useWindowDimensions } from 'react-native';

export const WEB_DESKTOP_BREAKPOINT = 992;
const SIDE_NAV_WIDTH = 256;
/** Matches AppShell `max-w-lg` (32rem). */
const MOBILE_WEB_MAX_WIDTH = 512;
/** TikTok-style centered profile column on wide web layouts. */
export const PROFILE_COLUMN_MAX_WIDTH = 560;

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= WEB_DESKTOP_BREAKPOINT;

  const videoHeight = isDesktop ? Math.min(height - 32, 780) : height;
  const videoWidth = isDesktop ? Math.round((videoHeight * 9) / 16) : width;

  const contentWidth = isDesktop
    ? width - SIDE_NAV_WIDTH
    : isWeb
      ? Math.min(width, MOBILE_WEB_MAX_WIDTH)
      : width;

  const profileWidth = isWeb ? Math.min(contentWidth, PROFILE_COLUMN_MAX_WIDTH) : width;

  return {
    isWeb,
    isDesktop,
    width,
    height,
    videoHeight,
    videoWidth,
    contentWidth,
    profileWidth,
    sideNavWidth: SIDE_NAV_WIDTH,
  };
}
