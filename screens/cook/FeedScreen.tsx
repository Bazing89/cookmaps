import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { CommentsSheet } from '../../components/cook/CommentsSheet';
import { DonateSheet } from '../../components/cook/DonateSheet';
import { LiveFeedCard } from '../../components/cook/LiveFeedCard';
import { useAuth } from '../../hooks/useAuth';
import { useFeedVideos } from '../../hooks/useFeedVideos';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useWebLayout } from '../../hooks/useWebLayout';
import { applyCreatorProfileToStream, creatorKeyForStream } from '../../lib/creatorPosts';
import { applyStreamDistances, sortStreamsByDistance } from '../../lib/geo';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

type Props = {
  onDonated: (stream: LiveStream, amount: number, plateId?: string, plateLabel?: string) => void;
  onOpenCreator: (creatorKey: string, postId?: string) => void;
};

export function FeedScreen({ onDonated, onOpenCreator }: Props) {
  const { profile } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const { isDesktop } = useWebLayout();
  const { streams, loading, error, refresh } = useFeedVideos();
  const { location: userLocation, permissionDenied, openSettings } = useUserLocation();
  const displayStreams = useMemo(() => {
    const located = sortStreamsByDistance(applyStreamDistances(streams, userLocation));
    if (!profile) return located;

    return located.map((stream) =>
      stream.creatorId === profile.id ? applyCreatorProfileToStream(stream, profile) : stream,
    );
  }, [streams, userLocation, profile]);

  useEffect(() => {
    if (!profile) return;
    void refresh();
  }, [profile?.avatar_url, profile?.display_name, profile?.handle, refresh]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [donateStream, setDonateStream] = useState<LiveStream | null>(null);
  const [commentStream, setCommentStream] = useState<LiveStream | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [feedHeight, setFeedHeight] = useState(windowHeight);
  const listRef = useRef<FlatList<LiveStream>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / Math.max(feedHeight, 1));
    if (index !== activeIndex) setActiveIndex(index);
  };

  const goToVideo = useCallback(
    (index: number) => {
      if (index < 0 || index >= displayStreams.length) return;
      listRef.current?.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    },
    [displayStreams.length],
  );

  const handleCommentCountChange = useCallback((postId: string, count: number) => {
    setCommentCounts((prev) => {
      if (prev[postId] === count) return prev;
      return { ...prev, [postId]: count };
    });
  }, []);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg }}
      onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
    >
      {permissionDenied && Platform.OS !== 'web' ? (
        <Pressable
          onPress={() => void openSettings()}
          className="absolute left-4 right-4 top-3 z-20 rounded-xl border border-white/10 px-3 py-2.5"
          style={{ backgroundColor: cookTheme.surface }}
        >
          <Text className="text-[12px] text-white" style={{ fontFamily: 'DMSans_500Medium' }}>
            Enable location to sort chefs by distance and show your position on the map.
          </Text>
          <Text
            className="mt-1 text-[11px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.accentSoft }}
          >
            Tap to open Settings
          </Text>
        </Pressable>
      ) : null}
      {loading && displayStreams.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={cookTheme.accent} />
        </View>
      ) : error && displayStreams.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-[15px] text-white/80"
            style={{ fontFamily: 'DMSans_500Medium' }}
          >
            {error}
          </Text>
        </View>
      ) : displayStreams.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-[15px] text-white/80"
            style={{ fontFamily: 'DMSans_500Medium' }}
          >
            No videos in your Bunny Stream library yet.
          </Text>
        </View>
      ) : (
      <FlatList
        ref={listRef}
        data={displayStreams}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={feedHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        className={Platform.OS === 'web' ? 'web-feed-scroll' : undefined}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        getItemLayout={(_, index) => ({
          length: feedHeight,
          offset: feedHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <View className={Platform.OS === 'web' ? 'web-feed-item' : undefined}>
            <LiveFeedCard
              stream={item}
              height={feedHeight}
              isActive={index === activeIndex}
              liked={likedIds.has(item.id)}
              onToggleLike={() => toggleLike(item.id)}
              onDonate={() => setDonateStream(item)}
              onAsk={() => setCommentStream(item)}
              commentCount={commentCounts[item.id] ?? item.commentCount ?? 0}
              onSelectPlate={() => setDonateStream(item)}
              onOpenCreator={(s) => onOpenCreator(creatorKeyForStream(s), s.id)}
              onPrevVideo={isDesktop ? () => goToVideo(index - 1) : undefined}
              onNextVideo={isDesktop ? () => goToVideo(index + 1) : undefined}
              canGoPrev={isDesktop && index > 0}
              canGoNext={isDesktop && index < displayStreams.length - 1}
              hasUserLocation={userLocation != null}
            />
          </View>
        )}
      />
      )}

      <DonateSheet
        visible={donateStream != null}
        stream={donateStream}
        onClose={() => setDonateStream(null)}
        onConfirm={(amount, plateId) => {
          if (!donateStream) return;
          const plateLabel = plateId
            ? donateStream.plates?.find((plate) => plate.id === plateId)?.label
            : donateStream.plates?.find((plate) => plate.price === amount)?.label;
          onDonated(donateStream, amount, plateId, plateLabel);
          setDonateStream(null);
        }}
      />

      <CommentsSheet
        visible={commentStream != null}
        stream={commentStream}
        onClose={() => setCommentStream(null)}
        onCommentCountChange={handleCommentCountChange}
      />
    </View>
  );
}
