import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { bunnyCdnRequestHeaders, isBunnyCdnUrl, resolveStreamVideoSource } from '../../lib/bunnyStream';
import type { LiveStream } from '../../types/live';

type Props = {
  stream: LiveStream;
  isActive: boolean;
  posterUri: string;
};

export type FeedVideoPlayerRef = {
  togglePlayback: () => void;
};

export const FeedVideoPlayer = forwardRef<FeedVideoPlayerRef, Props>(function FeedVideoPlayer(
  { stream, isActive, posterUri },
  ref,
) {
  const [userPaused, setUserPaused] = useState(false);
  const videoSource = resolveStreamVideoSource(stream.bunnyVideoId, stream.hlsUrl, stream.videoUrl);
  const posterSource = isBunnyCdnUrl(posterUri)
    ? { uri: posterUri, headers: bunnyCdnRequestHeaders() }
    : { uri: posterUri };

  const headers = videoSource && isBunnyCdnUrl(videoSource.uri) ? bunnyCdnRequestHeaders() : undefined;

  const player = useVideoPlayer(
    videoSource
      ? {
          uri: videoSource.uri,
          contentType: videoSource.contentType,
          headers,
        }
      : null,
    (p) => {
      p.loop = true;
      p.muted = false;
    },
  );

  useEffect(() => {
    if (!videoSource || !player) return;

    if (!isActive) {
      setUserPaused(false);
      player.pause();
      return;
    }

    if (!userPaused) {
      player.play();
    }
  }, [isActive, player, userPaused, videoSource]);

  const togglePlayback = useCallback(() => {
    if (!player || !isActive) return;

    if (userPaused) {
      player.play();
      setUserPaused(false);
    } else {
      player.pause();
      setUserPaused(true);
    }
  }, [isActive, player, userPaused]);

  useImperativeHandle(ref, () => ({ togglePlayback }), [togglePlayback]);

  if (!videoSource) {
    return (
      <Image
        source={posterSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        pointerEvents="none"
      />
      {!isActive ? (
        <Image
          source={posterSource}
          style={[StyleSheet.absoluteFill, styles.posterOverlay]}
          resizeMode="cover"
        />
      ) : null}
      {isActive && userPaused ? (
        <View style={styles.playIndicator} pointerEvents="none">
          <Ionicons name="play" size={56} color="rgba(255,255,255,0.92)" />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  posterOverlay: {
    opacity: 0.35,
  },
  playIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});
