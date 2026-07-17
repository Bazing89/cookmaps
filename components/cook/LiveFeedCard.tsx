import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { formatCount } from '../../data/lives';
import { useWebLayout } from '../../hooks/useWebLayout';
import { formatDistanceLabel } from '../../lib/geo';
import { resolveStreamThumbnail } from '../../lib/bunnyStream';
import { streamRequiresTicket, ticketsForStream, userHasStreamAccess } from '../../lib/tickets';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, TicketOffering } from '../../types/live';
import { FeedVideoPlayer, type FeedVideoPlayerRef } from './FeedVideoPlayer';
import { CreatorAvatar } from './CreatorAvatar';
import { TicketBar } from './PlatesBar';
import type { PurchasedTicket } from '../../screens/cook/types';

type Props = {
  stream: LiveStream;
  height: number;
  isActive: boolean;
  liked: boolean;
  onToggleLike: () => void;
  onBuyTicket: () => void;
  onAsk?: () => void;
  commentCount?: number;
  onOpenCreator?: (stream: LiveStream) => void;
  onAddTicket?: (ticket: TicketOffering) => void;
  purchasedTickets?: PurchasedTicket[];
  viewerId?: string | null;
  onPrevVideo?: () => void;
  onNextVideo?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  hasUserLocation?: boolean;
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
  onBuyTicket,
  onOpenCreator,
  overlay = true,
  hasUserLocation = false,
  bottomInset = 0,
}: {
  stream: LiveStream;
  pulse: Animated.Value;
  onBuyTicket: () => void;
  onOpenCreator?: (stream: LiveStream) => void;
  overlay?: boolean;
  hasUserLocation?: boolean;
  bottomInset?: number;
}) {
  const caption = [stream.dishName, stream.dishDescription].filter(Boolean).join(' · ');

  return (
    <View className={overlay ? 'absolute left-0 right-16 z-10 px-3' : 'absolute bottom-3 left-0 right-0 z-10 px-3'} style={overlay ? { bottom: 12 + bottomInset } : undefined} pointerEvents="box-none">
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
        <Pressable onPress={() => onOpenCreator?.(stream)}>
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
        </Pressable>
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

      <Pressable onPress={onBuyTicket} className="mt-2 flex-row items-center self-start">
        <Ionicons name="ticket-outline" size={13} color="#fff" />
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
          {stream.isLive
            ? `Live now · ticket $${stream.ticketPrice ?? stream.minDonation}`
            : `${stream.pickupNeighborhood || 'Nearby'} · ${formatDistanceLabel(stream.distanceMiles, hasUserLocation)}`}
        </Text>
      </Pressable>
    </View>
  );
}

function ActionRail({
  stream,
  liked,
  onToggleLike,
  onBuyTicket,
  onAsk,
  commentCount = 0,
  onOpenCreator,
  webDesktop = false,
}: {
  stream: LiveStream;
  liked: boolean;
  onToggleLike: () => void;
  onBuyTicket: () => void;
  onAsk?: () => void;
  commentCount?: number;
  onOpenCreator?: (stream: LiveStream) => void;
  webDesktop?: boolean;
}) {
  return (
    <View className={webDesktop ? 'ml-5 items-center pt-2' : 'absolute bottom-28 right-2 z-10 items-center'} pointerEvents="box-none">
      <Pressable onPress={() => onOpenCreator?.(stream)} className="mb-4 items-center" hitSlop={8}>
        <CreatorAvatar uri={stream.chefAvatar} name={stream.chefName} size={48} border />
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
      <ActionButton
        icon="chatbubble-ellipses-outline"
        label={commentCount > 0 ? formatCount(commentCount) : 'Ask'}
        onPress={onAsk ?? onBuyTicket}
        webDesktop={webDesktop}
      />
      <ActionButton
        icon="ticket-outline"
        label={`$${stream.ticketPrice ?? stream.minDonation}`}
        onPress={onBuyTicket}
        tint="#fff"
        webDesktop={webDesktop}
      />
      <ActionButton icon="share-social-outline" label="Share" onPress={() => {}} webDesktop={webDesktop} />
    </View>
  );
}

function WebVideoNavButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'chevron-up' | 'chevron-down';
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{
        backgroundColor: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

export function LiveFeedCard({
  stream,
  height,
  isActive,
  liked,
  onToggleLike,
  onBuyTicket,
  onAsk,
  commentCount,
  onOpenCreator,
  onAddTicket,
  purchasedTickets = [],
  viewerId,
  onPrevVideo,
  onNextVideo,
  canGoPrev = false,
  canGoNext = false,
  hasUserLocation = false,
}: Props) {
  const { isDesktop, videoHeight, videoWidth } = useWebLayout();
  const pulse = useRef(new Animated.Value(1)).current;
  const videoPlayerRef = useRef<FeedVideoPlayerRef>(null);
  const [ticketsDismissed, setTicketsDismissed] = useState(false);
  const hasAccess = userHasStreamAccess(stream, purchasedTickets, viewerId);
  const locked = streamRequiresTicket(stream) && !hasAccess;
  const streamTickets = ticketsForStream(stream);

  useEffect(() => {
    if (isActive) setTicketsDismissed(false);
  }, [isActive, stream.id]);

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
  const handleAddTicket = (ticket: TicketOffering) => {
    onAddTicket?.(ticket);
  };
  const showTicketBar =
    Boolean(isActive && streamTickets.length && stream.isLive && !hasAccess);
  const ticketBottomInset = showTicketBar && !ticketsDismissed ? 52 : 0;

  if (isDesktop) {
    return (
      <View
        style={{ height, backgroundColor: cookTheme.bg }}
        className="w-full items-center justify-center"
      >
        <WebVideoNavButton icon="chevron-up" onPress={onPrevVideo} disabled={!canGoPrev} />

        <View className="my-3 flex-row items-end">
          <View
            style={{
              width: videoWidth,
              height: videoHeight,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <FeedVideoPlayer
              ref={videoPlayerRef}
              stream={stream}
              isActive={isActive}
              posterUri={posterUri}
              locked={locked}
              onBuyTicket={onBuyTicket}
            />
            <Pressable
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 }}
              onPress={() => videoPlayerRef.current?.togglePlayback()}
            />
            <LinearGradient
              colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
              locations={[0, 0.72, 1]}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <CaptionBlock
              stream={stream}
              pulse={pulse}
              onBuyTicket={onBuyTicket}
              onOpenCreator={onOpenCreator}
              overlay={false}
              hasUserLocation={hasUserLocation}
              bottomInset={ticketBottomInset}
            />
            {showTicketBar && !ticketsDismissed ? (
              <TicketBar
                tickets={streamTickets}
                chefName={stream.chefName}
                onAddTicket={handleAddTicket}
                onClose={() => setTicketsDismissed(true)}
              />
            ) : null}
          </View>

          <ActionRail
            stream={stream}
            liked={liked}
            onToggleLike={onToggleLike}
            onBuyTicket={onBuyTicket}
            onAsk={onAsk}
            commentCount={commentCount}
            onOpenCreator={onOpenCreator}
            webDesktop
          />
        </View>

        <WebVideoNavButton icon="chevron-down" onPress={onNextVideo} disabled={!canGoNext} />
      </View>
    );
  }

  return (
    <View style={{ height, backgroundColor: cookTheme.bg }} className="w-full overflow-hidden">
      <FeedVideoPlayer
        ref={videoPlayerRef}
        stream={stream}
        isActive={isActive}
        posterUri={posterUri}
        locked={locked}
        onBuyTicket={onBuyTicket}
      />

      <Pressable
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 }}
        onPress={() => videoPlayerRef.current?.togglePlayback()}
      />

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
        onBuyTicket={onBuyTicket}
        onAsk={onAsk}
        commentCount={commentCount}
        onOpenCreator={onOpenCreator}
      />

      <CaptionBlock
        stream={stream}
        pulse={pulse}
        onBuyTicket={onBuyTicket}
        onOpenCreator={onOpenCreator}
        hasUserLocation={hasUserLocation}
        bottomInset={ticketBottomInset}
      />

      {showTicketBar && !ticketsDismissed ? (
        <TicketBar
          tickets={streamTickets}
          chefName={stream.chefName}
          onAddTicket={handleAddTicket}
          onClose={() => setTicketsDismissed(true)}
        />
      ) : null}
    </View>
  );
}
