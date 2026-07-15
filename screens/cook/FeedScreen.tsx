import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { DonateSheet } from '../../components/cook/DonateSheet';
import { LiveFeedCard } from '../../components/cook/LiveFeedCard';
import { LIVE_STREAMS } from '../../data/lives';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

type Props = {
  onDonated: (stream: LiveStream, amount: number) => void;
};

export function FeedScreen({ onDonated }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [donateStream, setDonateStream] = useState<LiveStream | null>(null);
  const [feedHeight, setFeedHeight] = useState(windowHeight);

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

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg }}
      onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
    >
      <FlatList
        data={LIVE_STREAMS}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={feedHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          length: feedHeight,
          offset: feedHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <LiveFeedCard
            stream={item}
            height={feedHeight}
            isActive={index === activeIndex}
            liked={likedIds.has(item.id)}
            onToggleLike={() => toggleLike(item.id)}
            onDonate={() => setDonateStream(item)}
          />
        )}
      />

      <DonateSheet
        visible={donateStream != null}
        stream={donateStream}
        onClose={() => setDonateStream(null)}
        onConfirm={(amount) => {
          if (donateStream) onDonated(donateStream, amount);
          setDonateStream(null);
        }}
      />
    </View>
  );
}
