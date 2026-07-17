import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { bunnyCdnRequestHeaders, isBunnyCdnUrl, resolveStreamVideoSource } from '../../lib/bunnyStream';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

type Props = {
  stream: LiveStream;
  isActive: boolean;
  posterUri: string;
  /** When true, show preview only — user must buy a ticket to watch live */
  locked?: boolean;
  onBuyTicket?: () => void;
};

export type FeedVideoPlayerRef = {
  togglePlayback: () => void;
};

export const FeedVideoPlayer = forwardRef<FeedVideoPlayerRef, Props>(function FeedVideoPlayer(
  { stream, isActive, posterUri, locked = false, onBuyTicket },
  ref,
) {
  const [userPaused, setUserPaused] = useState(false);
  const videoSource = locked
    ? null
    : resolveStreamVideoSource(stream.bunnyVideoId, stream.hlsUrl, stream.videoUrl, {
        preferHls: stream.isLive,
      });
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
    if (!videoSource || !player || locked) return;

    if (!isActive) {
      setUserPaused(false);
      player.pause();
      return;
    }

    if (!userPaused) {
      player.play();
    }
  }, [isActive, locked, player, userPaused, videoSource]);

  const togglePlayback = useCallback(() => {
    if (!player || !isActive || locked) return;

    if (userPaused) {
      player.play();
      setUserPaused(false);
    } else {
      player.pause();
      setUserPaused(true);
    }
  }, [isActive, locked, player, userPaused]);

  useImperativeHandle(ref, () => ({ togglePlayback }), [togglePlayback]);

  if (locked || !videoSource) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Image source={posterSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.lockOverlay} pointerEvents="box-none">
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={28} color="#fff" />
          </View>
          <Text style={styles.lockTitle}>Live stream locked</Text>
          <Text style={styles.lockSubtitle}>
            Buy a ticket to watch {stream.chefName} cook {stream.dishName} live.
          </Text>
          {onBuyTicket ? (
            <Pressable onPress={onBuyTicket} style={styles.buyButton}>
              <Ionicons name="ticket-outline" size={18} color="#fff" />
              <Text style={styles.buyButtonText}>
                Get ticket · ${stream.ticketPrice ?? stream.minDonation}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
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
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 32,
  },
  lockBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  lockTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  lockSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: cookTheme.accent,
  },
  buyButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
  },
});
