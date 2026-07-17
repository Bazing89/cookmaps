import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  createCreatorPost,
  displayHandle,
  endLivePost,
} from '../../lib/creatorPosts';
import { uploadShortToBunny } from '../../lib/bunnyUpload';
import { isBunnyApiConfigured } from '../../lib/bunnyApi';
import { supabase } from '../../lib/supabase';
import { cookTheme } from '../../theme/cookTheme';

type CreatorMode = 'short' | 'live';

type LiveSession = {
  postId: string;
  streamKey: string;
  rtmpUrl: string;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View className="mb-4">
      <Text
        className="mb-2 text-[12px] uppercase tracking-wide"
        style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(168, 162, 154, 0.7)"
        multiline={multiline}
        keyboardType={keyboardType}
        className="rounded-2xl border border-white/10 px-4 py-3.5 text-[15px] text-white"
        style={{
          fontFamily: 'DMSans_400Regular',
          backgroundColor: cookTheme.surfaceElevated,
          minHeight: multiline ? 88 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

export function GoLiveScreen() {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<CreatorMode>('short');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoMime, setVideoMime] = useState('video/mp4');
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupNeighborhood, setPickupNeighborhood] = useState('');
  const [minDonation, setMinDonation] = useState('8');
  const [donationGoal, setDonationGoal] = useState('100');
  const [readyInMinutes, setReadyInMinutes] = useState('30');

  const pickVideo = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow access to your video library to upload a short.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 180,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setVideoMime(result.assets[0].mimeType ?? 'video/mp4');
    }
  }, []);

  const publishShort = useCallback(async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('Add a title for your short.');
      return;
    }
    if (!videoUri) {
      setError('Select a video to post.');
      return;
    }
    if (!isBunnyApiConfigured) {
      setError(
        'Bunny Stream is not configured. Add EXPO_PUBLIC_BUNNY_STREAM_API_KEY and EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID to .env, then restart Expo.',
      );
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const post = await createCreatorPost(user.id, {
        post_type: 'short',
        title: title.trim(),
        description: description.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        min_donation: Number(minDonation) || 8,
        donation_goal: Number(donationGoal) || 100,
        pickup_address: pickupAddress.trim(),
        pickup_neighborhood: pickupNeighborhood.trim(),
        ready_in_minutes: Number(readyInMinutes) || 30,
        status: 'processing',
        cover_image: profile?.avatar_url ?? undefined,
      });

      if (!post) throw new Error('Could not create post');

      const chefName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Home Chef';
      const chefHandle = profile ? displayHandle(profile) : '@chef';

      const bunny = await uploadShortToBunny({
        title: title.trim(),
        description: description.trim() || undefined,
        fileUri: videoUri,
        metaTags: [
          { property: 'creatorPostId', value: post.id },
          { property: 'creatorId', value: user.id },
          { property: 'chefName', value: chefName },
          { property: 'chefHandle', value: chefHandle },
          { property: 'chefAvatar', value: profile?.avatar_url ?? '' },
          { property: 'pickupAddress', value: pickupAddress.trim() },
          { property: 'pickupNeighborhood', value: pickupNeighborhood.trim() },
          { property: 'minDonation', value: String(Number(minDonation) || 8) },
          { property: 'donationGoal', value: String(Number(donationGoal) || 100) },
          { property: 'readyInMinutes', value: String(Number(readyInMinutes) || 30) },
        ],
      });

      const { error: updateError } = await supabase
        .from('creator_posts')
        .update({
          bunny_video_id: bunny.videoId,
          thumbnail_url: bunny.thumbnailUrl,
          cover_image: bunny.thumbnailUrl ?? profile?.avatar_url ?? null,
          status: 'published',
        })
        .eq('id', post.id);

      if (updateError) throw new Error(updateError.message);

      setMessage('Short uploaded to Bunny! It may take a minute to process, then check For You and your profile.');
      setVideoUri(null);
      setTitle('');
      setDescription('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }, [
    user,
    title,
    videoUri,
    videoMime,
    description,
    cuisine,
    minDonation,
    donationGoal,
    pickupAddress,
    pickupNeighborhood,
    readyInMinutes,
    profile?.avatar_url,
  ]);

  const startLive = useCallback(async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('Add a title before going live.');
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const streamKey = `${user.id.slice(0, 8)}-${Date.now()}`;
      const rtmpUrl = 'rtmp://live.bunnycdn.com/live';

      const post = await createCreatorPost(user.id, {
        post_type: 'live',
        title: title.trim(),
        description: description.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        min_donation: Number(minDonation) || 8,
        donation_goal: Number(donationGoal) || 100,
        pickup_address: pickupAddress.trim(),
        pickup_neighborhood: pickupNeighborhood.trim(),
        ready_in_minutes: Number(readyInMinutes) || 30,
        is_live: true,
        status: 'live',
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        cover_image: profile?.avatar_url ?? undefined,
      });

      if (!post) throw new Error('Could not start live session');

      setLiveSession({ postId: post.id, streamKey, rtmpUrl });
      setMessage('You are live! Viewers can buy tickets to join and watch you cook.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not go live');
    } finally {
      setBusy(false);
    }
  }, [
    user,
    title,
    description,
    cuisine,
    minDonation,
    donationGoal,
    pickupAddress,
    pickupNeighborhood,
    readyInMinutes,
    profile?.avatar_url,
  ]);

  const stopLive = useCallback(async () => {
    if (!user || !liveSession) return;
    setBusy(true);
    try {
      await endLivePost(liveSession.postId, user.id);
      setLiveSession(null);
      setMessage('Live stream ended.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not end stream');
    } finally {
      setBusy(false);
    }
  }, [liveSession, user]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Cook
        </Text>
        <Text
          className="mt-1 text-[14px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Post a short or go live — sell tickets so viewers can watch you cook.
        </Text>

        <View
          className="mt-5 flex-row items-center gap-2 rounded-full p-1"
          style={{ backgroundColor: cookTheme.surfaceElevated }}
        >
          <Pressable
            onPress={() => {
              setMode('short');
              setError(null);
            }}
            className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
            style={mode === 'short' ? { backgroundColor: cookTheme.accent } : undefined}
          >
            <Ionicons name="film-outline" size={16} color="#fff" />
            <Text
              className="ml-1.5 text-[13px] text-white"
              style={{
                fontFamily: mode === 'short' ? 'DMSans_600SemiBold' : 'DMSans_500Medium',
              }}
            >
              Post short
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode('live');
              setError(null);
              setVideoUri(null);
            }}
            className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
            style={mode === 'live' ? { backgroundColor: cookTheme.accent } : undefined}
          >
            <Ionicons name="radio-outline" size={16} color="#fff" />
            <Text
              className="ml-1.5 text-[13px] text-white"
              style={{
                fontFamily: mode === 'live' ? 'DMSans_600SemiBold' : 'DMSans_500Medium',
              }}
            >
              Go live
            </Text>
          </Pressable>
        </View>

        <View
          className="mt-5 rounded-3xl border border-white/10 px-5 py-5"
          style={{ backgroundColor: cookTheme.surface }}
        >
          {mode === 'short' ? (
            <>
              <Pressable
                onPress={() => void pickVideo()}
                className="mb-5 flex-row items-center justify-center rounded-2xl border border-dashed border-white/20 py-10"
                style={{ backgroundColor: cookTheme.surfaceElevated }}
              >
                <Ionicons
                  name={videoUri ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={32}
                  color={cookTheme.accentSoft}
                />
                <View className="ml-3">
                  <Text className="text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                    {videoUri ? 'Video ready — tap to change' : 'Upload your short'}
                  </Text>
                  <Text
                    className="mt-0.5 text-[12px]"
                    style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                  >
                    Up to 3 minutes · MP4 or MOV
                  </Text>
                </View>
              </Pressable>

              <Field
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Chili crisp noodles"
              />

              <Pressable
                onPress={() => void publishShort()}
                disabled={busy}
                className="flex-row items-center justify-center rounded-2xl py-3.5"
                style={{ backgroundColor: cookTheme.accent, opacity: busy ? 0.7 : 1 }}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                    <Text className="ml-2 text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                      Post short
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          ) : liveSession ? (
            <View>
              <View
                className="mb-4 rounded-2xl border border-white/10 px-4 py-4"
                style={{ backgroundColor: cookTheme.surfaceElevated }}
              >
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: cookTheme.live }} />
                  <Text className="text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                    LIVE now
                  </Text>
                </View>
                <Text className="text-[12px] text-white/70" style={{ fontFamily: 'DMSans_400Regular' }}>
                  RTMP URL: {liveSession.rtmpUrl}
                </Text>
                <Text className="mt-1 text-[12px] text-white/70" style={{ fontFamily: 'DMSans_400Regular' }}>
                  Stream key: {liveSession.streamKey}
                </Text>
                <Text
                  className="mt-3 text-[12px] leading-5"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Use OBS, Larix, or Bunny Stream mobile encoder with the RTMP URL and stream key above.
                </Text>
              </View>
              <Pressable
                onPress={() => void stopLive()}
                disabled={busy}
                className="flex-row items-center justify-center rounded-2xl py-3.5"
                style={{ backgroundColor: cookTheme.live, opacity: busy ? 0.7 : 1 }}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                    End live stream
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              <Field
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="What's cooking tonight?"
              />

              <Field
                label="Ticket price ($)"
                value={minDonation}
                onChangeText={setMinDonation}
                placeholder="8"
                keyboardType="numeric"
              />

              <Field
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="What are you cooking live?"
                multiline
              />

              <Pressable
                onPress={() => void startLive()}
                disabled={busy}
                className="flex-row items-center justify-center rounded-2xl py-3.5"
                style={{ backgroundColor: cookTheme.live, opacity: busy ? 0.7 : 1 }}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="radio" size={20} color="#fff" />
                    <Text className="ml-2 text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                      Go live
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}

          {error ? (
            <Text
              className="mt-3 text-[13px]"
              style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.live }}
            >
              {error}
            </Text>
          ) : null}
          {message ? (
            <Text
              className="mt-3 text-[13px]"
              style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.success }}
            >
              {message}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
