import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { formatCount } from '../../data/lives';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable onPress={onPress} className="mb-5 items-center" hitSlop={8}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-black/35">
        <Ionicons name={icon} size={26} color={tint ?? '#fff'} />
      </View>
      <Text
        className="mt-1 text-[11px] font-semibold text-white"
        style={{ fontFamily: 'DMSans_600SemiBold' }}
      >
        {label}
      </Text>
    </Pressable>
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
  const pulse = useRef(new Animated.Value(1)).current;
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (!isActive) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  const progress = Math.min(1, stream.donationRaised / stream.donationGoal);

  const onProgressLayout = (e: LayoutChangeEvent) => {
    setProgressWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={{ height, backgroundColor: cookTheme.bg }} className="w-full overflow-hidden">
      <Image
        source={{ uri: stream.coverImage }}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />

      {/* Atmosphere wash — kitchen heat, not flat black */}
      <LinearGradient
        colors={['rgba(11,11,12,0.35)', 'transparent', 'transparent', 'rgba(11,11,12,0.92)']}
        locations={[0, 0.22, 0.48, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,77,26,0.18)']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />

      {/* Top meta */}
      <View className="absolute left-4 right-4 top-3 z-10 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center rounded-md bg-black/45 px-2.5 py-1.5">
            <Animated.View
              style={{
                transform: [{ scale: pulse }],
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: cookTheme.live,
                marginRight: 6,
              }}
            />
            <Text
              className="text-[11px] tracking-widest text-white"
              style={{ fontFamily: 'Syne_700Bold' }}
            >
              LIVE
            </Text>
          </View>
          <View className="rounded-md bg-black/45 px-2.5 py-1.5">
            <Text
              className="text-[11px] text-white/90"
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              {formatCount(stream.viewerCount)} watching
            </Text>
          </View>
        </View>
        <Text
          className="text-[15px] tracking-tight text-white"
          style={{ fontFamily: 'Syne_800ExtraBold' }}
        >
          CookMapz
        </Text>
      </View>

      {/* Right action rail */}
      <View className="absolute bottom-36 right-3 z-10 items-center">
        <Pressable onPress={onDonate} className="mb-5 items-center">
          <View className="overflow-hidden rounded-full border-2 border-white">
            <Image source={{ uri: stream.chefAvatar }} className="h-12 w-12" />
          </View>
          <View
            className="-mt-2 h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: cookTheme.accent }}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </View>
        </Pressable>

        <ActionButton
          icon={liked ? 'heart' : 'heart-outline'}
          label={formatCount(stream.likeCount + (liked ? 1 : 0))}
          onPress={onToggleLike}
          tint={liked ? cookTheme.live : '#fff'}
        />
        <ActionButton icon="chatbubble-ellipses-outline" label="Ask" onPress={onDonate} />
        <ActionButton
          icon="flame"
          label={`$${stream.minDonation}+`}
          onPress={onDonate}
          tint={cookTheme.accentSoft}
        />
        <ActionButton icon="share-social-outline" label="Share" onPress={() => {}} />
      </View>

      {/* Bottom info */}
      <View className="absolute bottom-0 left-0 right-16 z-10 px-4 pb-5">
        <Text
          className="text-[13px] text-white/80"
          style={{ fontFamily: 'DMSans_500Medium' }}
        >
          {stream.chefName} · {stream.chefHandle}
        </Text>
        <Text
          className="mt-1 text-[26px] leading-8 text-white"
          style={{ fontFamily: 'Syne_800ExtraBold' }}
        >
          {stream.dishName}
        </Text>
        <Text
          className="mt-1.5 text-[13px] leading-5 text-white/85"
          style={{ fontFamily: 'DMSans_400Regular' }}
          numberOfLines={2}
        >
          {stream.dishDescription}
        </Text>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <View className="flex-row items-center rounded-full bg-white/12 px-2.5 py-1">
            <Ionicons name="location-outline" size={13} color="#fff" />
            <Text
              className="ml-1 text-[11px] text-white"
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              {stream.pickupNeighborhood} · {stream.distanceMiles} mi
            </Text>
          </View>
          <View className="rounded-full bg-white/12 px-2.5 py-1">
            <Text
              className="text-[11px] text-white"
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              Ready in ~{stream.readyInMinutes}m
            </Text>
          </View>
          <View className="rounded-full bg-white/12 px-2.5 py-1">
            <Text
              className="text-[11px] text-white"
              style={{ fontFamily: 'DMSans_500Medium' }}
            >
              {stream.cuisine}
            </Text>
          </View>
        </View>

        {/* Donation progress → unlocks pickup */}
        <Pressable
          onPress={onDonate}
          className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-black/40 px-3.5 py-3"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              className="text-[12px] text-white"
              style={{ fontFamily: 'DMSans_600SemiBold' }}
            >
              Donate to claim a plate
            </Text>
            <Text
              className="text-[12px]"
              style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.accentSoft }}
            >
              ${stream.donationRaised} / ${stream.donationGoal}
            </Text>
          </View>
          <View
            onLayout={onProgressLayout}
            className="h-1.5 overflow-hidden rounded-full bg-white/20"
          >
            <View
              className="h-full rounded-full"
              style={{
                width: progressWidth * progress,
                backgroundColor: cookTheme.accent,
              }}
            />
          </View>
          <Text
            className="mt-2 text-[11px] text-white/70"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            {stream.pickupAddress} · pickup after donate
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
