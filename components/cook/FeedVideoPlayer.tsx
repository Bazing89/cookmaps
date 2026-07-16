import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { bunnyCdnRequestHeaders, isBunnyCdnUrl, resolveStreamVideoSource } from '../../lib/bunnyStream';
import type { LiveStream } from '../../types/live';

type Props = {
  stream: LiveStream;
  isActive: boolean;
  posterUri: string;
};

export function FeedVideoPlayer({ stream, isActive, posterUri }: Props) {
  const videoSource = resolveStreamVideoSource(stream.bunnyVideoId, stream.hlsUrl);
  const posterSource = isBunnyCdnUrl(posterUri)
    ? { uri: posterUri, headers: bunnyCdnRequestHeaders() }
    : { uri: posterUri };

  const player = useVideoPlayer(
    videoSource
      ? {
          uri: videoSource.uri,
          contentType: videoSource.contentType,
          headers: bunnyCdnRequestHeaders(),
        }
      : null,
    (p) => {
      p.loop = true;
      p.muted = false;
    },
  );

  useEffect(() => {
    if (!videoSource || !player) return;

    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player, videoSource]);

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
      />
      {!isActive ? (
        <Image
          source={posterSource}
          style={[StyleSheet.absoluteFill, styles.posterOverlay]}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  posterOverlay: {
    opacity: 0.35,
  },
});
