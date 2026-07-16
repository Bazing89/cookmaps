import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { formatCount } from '../../data/lives';
import { useWebLayout } from '../../hooks/useWebLayout';
import { resolveStreamThumbnail } from '../../lib/bunnyStream';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';
import { FeedVideoPlayer } from './FeedVideoPlayer';

type Props = {
  stream: LiveStream;
  height: number;
  isActive: boolean;
  liked: boolean;
  onToggleLike: () => void;
  onDonate: () => void;
};

function ActionButton({
  icon,
  label,
  onPress,
  tint,
  webDesktop = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tint?: string;
  webDesktop?: boolean;
}) {
  if (webDesktop) {
    return (
      <Pressable onPress={onPress} className="mb-5 items-center" hitSlop={8}>
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <Ionicons name={icon} size={24} color={tint ?? '#fff'} />
        </View>
        <Text className="mt-1 text-[12px] text-white/90" style={{ fontFamily: 'DMSans_600SemiBold' }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} className="mb-4 items-center" hitSlop={8}>
      <View className="h-11 w-11 items-center justify-center">
        <Ionicons name={icon} size={30} color={tint ?? '#fff'} />
      </View>
      <Text
        className="text-[11px] text-white"
        style={{
          fontFamily: 'DMSans_600SemiBold',
          textShadowColor: 'rgba(0,0,0,0.75)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CaptionBlock({
  stream,
  pulse,
  onDonate,
  overlay = true,
}: {
  stream: LiveStream;
  pulse: Animated.Value;
  onDonate: () => void;
  overlay?: boolean;
}) {
  const caption = [stream.dishName, stream.dishDescription].filter(Boolean).join(' · ');

  return (
    <View className={overlay ? 'absolute bottom-3 left-0 right-16 z-10 px-3' : 'absolute bottom-3 left-0 right-0 z-10 px-3'}>
      <View className="mb-1.5 flex-row items-center gap-2">
        {stream.isLive ? (
          <View
            className="flex-row items-center rounded px-1.5 py-0.5"
            style={{ backgroundColor: cookTheme.live }}
          >
            <Animated.View
              style={{
                transform: [{ scale: pulse }],
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#fff',
                marginRight: 4,
              }}
            />
            <Text className="text-[10px] font-bold text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              LIVE
            </Text>
          </View>
        ) : null}
        <Text
          className="text-[14px] text-white"
          style={{
            fontFamily: 'DMSans_600SemiBold',
            ...(overlay
              ? {
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }
              : {}),
          }}
        >
          {stream.chefHandle}
        </Text>
      </View>

      <Text
        className="text-[14px] leading-5 text-white"
        style={{
          fontFamily: 'DMSans_400Regular',
          ...(overlay
            ? {
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }
            : {}),
        }}
        numberOfLines={2}
      >
        {caption}
      </Text>

      <Pressable onPress={onDonate} className="mt-2 flex-row items-center self-start">
        <Ionicons name="location-outline" size={13} color="#fff" />
        <Text
          className="ml-1 text-[12px] text-white/90"
          style={{
            fontFamily: 'DMSans_500Medium',
            ...(overlay
              ? {
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }
              : {}),
          }}
          numberOfLines={1}
        >
          {stream.pickupNeighborhood} · {stream.distanceMiles} mi · claim ${stream.minDonation}+
        </Text>
      </Pressable>
    </View>
  );
}

function ActionRail({
  stream,
  liked,
  onToggleLike,
  onDonate,
  webDesktop = false,
}: {
  stream: LiveStream;
  liked: boolean;
  onToggleLike: () => void;
  onDonate: () => void;
  webDesktop?: boolean;
}) {
  return (
    <View className={webDesktop ? 'ml-5 items-center pt-2' : 'absolute bottom-28 right-2 z-10 items-center'}>
      <Pressable onPress={onDonate} className="mb-4 items-center" hitSlop={8}>
        <View className="overflow-hidden rounded-full border-2 border-white">
          <Image source={{ uri: stream.chefAvatar }} className="h-12 w-12" />
        </View>
        <View
          className="-mt-2.5 h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: cookTheme.accent }}
        >
          <Ionicons name="add" size={13} color="#fff" />
        </View>
      </Pressable>

      <ActionButton
        icon={liked ? 'heart' : 'heart-outline'}
        label={formatCount(stream.likeCount + (liked ? 1 : 0))}
        onPress={onToggleLike}
        tint={liked ? cookTheme.live : '#fff'}
        webDesktop={webDesktop}
      />
      <ActionButton icon="chatbubble-ellipses-outline" label="Ask" onPress={onDonate} webDesktop={webDesktop} />
      <ActionButton
        icon="gift-outline"
        label={`$${stream.minDonation}`}
        onPress={onDonate}
        tint="#fff"
        webDesktop={webDesktop}
      />
      <ActionButton icon="share-social-outline" label="Share" onPress={() => {}} webDesktop={webDesktop} />
    </View>
  );
}

export function LiveFeedCard({
  stream,
  height,
  isActive,
  liked,
  onToggleLike,
  onDonate,
}: Props) {
  const { isDesktop, videoHeight, videoWidth } = useWebLayout();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  const posterUri = resolveStreamThumbnail(
    stream.coverImage,
    stream.bunnyVideoId,
    stream.thumbnailUrl,
  );

  if (isDesktop) {
    return (
      <View
        style={{ height, backgroundColor: cookTheme.bg }}
        className="w-full items-center justify-center"
      >
        <View className="flex-row items-end">
          <View
            style={{
              width: videoWidth,
              height: videoHeight,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <FeedVideoPlayer stream={stream} isActive={isActive} posterUri={posterUri} />
            <LinearGradient
              colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
              locations={[0, 0.72, 1]}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <CaptionBlock stream={stream} pulse={pulse} onDonate={onDonate} overlay={false} />
          </View>

          <ActionRail
            stream={stream}
            liked={liked}
            onToggleLike={onToggleLike}
            onDonate={onDonate}
            webDesktop
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ height, backgroundColor: cookTheme.bg }} className="w-full overflow-hidden">
      <FeedVideoPlayer stream={stream} isActive={isActive} posterUri={posterUri} />

      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
        locations={[0, 0.72, 1]}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />

      <ActionRail
        stream={stream}
        liked={liked}
        onToggleLike={onToggleLike}
        onDonate={onDonate}
      />

      <CaptionBlock stream={stream} pulse={pulse} onDonate={onDonate} />
    </View>
  );
}
