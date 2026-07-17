import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiveFeedCard } from '../../components/cook/LiveFeedCard';
import { CommentsSheet } from '../../components/cook/CommentsSheet';
import { CreatorAvatar } from '../../components/cook/CreatorAvatar';
import { formatCount } from '../../data/lives';
import { useWebLayout } from '../../hooks/useWebLayout';
import {
  applyCreatorProfileToStream,
  creatorKeyForStream,
  displayHandle,
  fetchCreatorProfile,
  fetchPostsByCreator,
} from '../../lib/creatorPosts';
import { fetchFeedVideos } from '../../lib/feedVideos';
import { StreamThumbnailImage } from '../../components/cook/StreamThumbnailImage';
import { cookTheme } from '../../theme/cookTheme';
import type { CreatorProfile } from '../../types/creator';
import type { LiveStream } from '../../types/live';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  creatorKey: string;
  startPostId?: string;
  onBack: () => void;
  onDonate?: (stream: LiveStream) => void;
};

function profileFromStream(stream: LiveStream, key: string): CreatorProfile {
  return {
    id: stream.creatorId ?? key,
    display_name: stream.chefName,
    handle: stream.chefHandle.replace(/^@/, ''),
    avatar_url: stream.chefAvatar,
    bio: stream.dishDescription || null,
    role: 'chef',
    follower_count: 0,
    email: null,
  };
}

function ProfileBackHeader({
  title,
  onBack,
}: {
  title?: string;
  onBack: () => void;
}) {
  return (
    <View className="flex-row items-center px-4 pb-2 pt-1">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        className="mr-2 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: cookTheme.surfaceElevated }}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </Pressable>
      {title ? (
        <Text
          className="flex-1 text-[18px] text-white"
          style={{ fontFamily: 'Syne_700Bold' }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}

export function CreatorProfileScreen({ creatorKey, startPostId, onBack, onDonate }: Props) {
  const { height, profileWidth, isWeb, isDesktop } = useWebLayout();
  const profilePadding = 40;
  const gridGap = 2;
  const cellSize = Math.floor((profileWidth - profilePadding - gridGap * 2) / 3);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [commentStream, setCommentStream] = useState<LiveStream | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const listRef = useRef<FlatList<LiveStream>>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (UUID_RE.test(creatorKey)) {
        const [p, posts] = await Promise.all([
          fetchCreatorProfile(creatorKey),
          fetchPostsByCreator(creatorKey),
        ]);
        setProfile(p);
        setStreams(posts);
      } else {
        const feed = await fetchFeedVideos();
        const filtered = feed.filter((s) => creatorKeyForStream(s) === creatorKey);
        setStreams(filtered);
        setProfile(filtered[0] ? profileFromStream(filtered[0], creatorKey) : null);
      }
    } finally {
      setLoading(false);
    }
  }, [creatorKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!startPostId || !streams.length) return;
    const idx = streams.findIndex((s) => s.id === startPostId);
    if (idx >= 0) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  }, [startPostId, streams]);

  const totalLikes = useMemo(
    () => streams.reduce((sum, s) => sum + s.likeCount, 0),
    [streams],
  );

  const displayStreams = useMemo(() => {
    if (!profile) return streams;
    return streams.map((stream) => applyCreatorProfileToStream(stream, profile));
  }, [profile, streams]);

  const openVideo = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const handleCommentCountChange = useCallback((postId: string, count: number) => {
    setCommentCounts((prev) => {
      if (prev[postId] === count) return prev;
      return { ...prev, [postId]: count };
    });
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setViewerIndex(first.index);
  }).current;

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1${isWeb ? ' items-center' : ''}`}
        style={{ backgroundColor: cookTheme.bg }}
        edges={['top', 'left', 'right']}
      >
        <ProfileBackHeader onBack={onBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={cookTheme.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const name = profile?.display_name ?? 'Chef';
  const handle = profile ? displayHandle(profile) : creatorKey;

  return (
    <SafeAreaView
      className={`flex-1${isWeb ? ' items-center' : ''}`}
      style={{ backgroundColor: cookTheme.bg }}
      edges={['top', 'left', 'right']}
    >
      <View
        className="flex-1 self-center"
        style={{
          width: '100%',
          maxWidth: profileWidth,
          ...(isWeb && isDesktop ? { alignSelf: 'center' as const } : undefined),
        }}
      >
      <ProfileBackHeader title={handle} onBack={onBack} />

      <FlatList
        className="flex-1"
        data={displayStreams}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{
          gap: gridGap,
          marginBottom: gridGap,
          width: cellSize * 3 + gridGap * 2,
          alignSelf: 'center',
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="mb-5 items-center pt-2">
            <CreatorAvatar
              uri={profile?.avatar_url}
              name={profile?.display_name ?? streams[0]?.chefName}
              size={96}
            />
            <Text className="mt-3 text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
              {name}
            </Text>
            <Text
              className="mt-0.5 text-[14px]"
              style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.textMuted }}
            >
              {handle}
            </Text>
            {profile?.bio ? (
              <Text
                className="mt-3 text-center text-[13px] leading-5"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                {profile.bio}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-8">
              <Stat label="Videos" value={String(streams.length)} />
              <Stat label="Followers" value={formatCount(profile?.follower_count ?? 0)} />
              <Stat label="Likes" value={formatCount(totalLikes)} />
            </View>

            <Pressable
              className="mt-5 rounded-full px-8 py-2.5"
              style={{ backgroundColor: cookTheme.accent }}
            >
              <Text className="text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                Follow
              </Text>
            </Pressable>

            <View className="mt-6 w-full flex-row border-b border-white/10 pb-2">
              <View className="flex-1 items-center border-b-2" style={{ borderColor: cookTheme.accent }}>
                <Ionicons name="grid-outline" size={20} color="#fff" />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text
            className="mt-8 text-center text-[14px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            No videos yet.
          </Text>
        }
        renderItem={({ item, index }) => {
          return (
            <Pressable
              onPress={() => openVideo(index)}
              style={{ width: cellSize, height: cellSize * 1.35 }}
            >
              <StreamThumbnailImage stream={item} className="h-full w-full" />
              {item.isLive ? (
                <View
                  className="absolute left-1 top-1 rounded px-1.5 py-0.5"
                  style={{ backgroundColor: cookTheme.live }}
                >
                  <Text className="text-[9px] font-bold text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                    LIVE
                  </Text>
                </View>
              ) : null}
              <View className="absolute bottom-1 left-1 flex-row items-center">
                <Ionicons name="play" size={12} color="#fff" />
                <Text className="ml-0.5 text-[11px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                  {formatCount(item.viewerCount || item.likeCount)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Modal visible={viewerOpen} animationType="slide" onRequestClose={() => setViewerOpen(false)}>
        <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
          <Pressable
            onPress={() => setViewerOpen(false)}
            className="absolute left-4 top-12 z-20 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            accessibilityLabel="Back to profile"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <FlatList
        className="flex-1"
            ref={listRef}
            data={displayStreams}
            keyExtractor={(item) => item.id}
            pagingEnabled
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <LiveFeedCard
                stream={item}
                height={height}
                isActive={index === viewerIndex}
                liked={likedIds.has(item.id)}
                onToggleLike={() =>
                  setLikedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
                onBuyTicket={() => onDonate?.(item)}
                onAsk={() => setCommentStream(item)}
                commentCount={commentCounts[item.id] ?? 0}
              />
            )}
          />
        </View>
      </Modal>

      <CommentsSheet
        visible={commentStream != null}
        stream={commentStream}
        onClose={() => setCommentStream(null)}
        onCommentCountChange={handleCommentCountChange}
      />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-[18px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
        {value}
      </Text>
      <Text
        className="mt-0.5 text-[12px]"
        style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
      >
        {label}
      </Text>
    </View>
  );
}
