import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  createPlatesForPost,
  displayHandle,
  endLivePost,
} from '../../lib/creatorPosts';
import { uploadShortToBunny } from '../../lib/bunnyUpload';
import { isBunnyApiConfigured } from '../../lib/bunnyApi';
import { uploadPlateImage } from '../../lib/plates';
import { supabase } from '../../lib/supabase';
import { cookTheme } from '../../theme/cookTheme';

type CreatorMode = 'short' | 'live';

type LiveSession = {
  postId: string;
  streamKey: string;
  rtmpUrl: string;
};

type DraftPlate = {
  id: string;
  label: string;
  description: string;
  price: string;
  imageUri: string | null;
  imageMime: string;
};

function newDraftPlate(): DraftPlate {
  return {
    id: `${Date.now()}-${Math.random()}`,
    label: '',
    description: '',
    price: '',
    imageUri: null,
    imageMime: 'image/jpeg',
  };
}

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

function PlatePhotoPicker({
  imageUri,
  onPick,
}: {
  imageUri: string | null;
  onPick: () => void;
}) {
  return (
    <Pressable
      onPress={onPick}
      className="mb-4 overflow-hidden rounded-2xl border border-dashed border-white/20"
      style={{ backgroundColor: cookTheme.surface, height: 140 }}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="camera-outline" size={28} color={cookTheme.accentSoft} />
          <Text
            className="mt-2 text-center text-[13px] text-white"
            style={{ fontFamily: 'DMSans_600SemiBold' }}
          >
            Add plate photo
          </Text>
          <Text
            className="mt-1 text-center text-[11px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Required · show what buyers will get
          </Text>
        </View>
      )}
      {imageUri ? (
        <View
          className="absolute bottom-2 right-2 flex-row items-center rounded-full px-2.5 py-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Ionicons name="camera-outline" size={14} color="#fff" />
          <Text className="ml-1 text-[11px] text-white" style={{ fontFamily: 'DMSans_500Medium' }}>
            Change photo
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

async function pickPlatePhoto(): Promise<{ uri: string; mimeType: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow access to your photo library to add a plate picture.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.canceled || !result.assets[0]) return null;

  return {
    uri: result.assets[0].uri,
    mimeType: result.assets[0].mimeType ?? 'image/jpeg',
  };
}

function PlateEditorSection({
  draftPlates,
  onChangePlates,
}: {
  draftPlates: DraftPlate[];
  onChangePlates: (plates: DraftPlate[]) => void;
}) {
  return (
    <>
      {draftPlates.length > 0 ? (
        <View className="mb-4 gap-3">
          <Text
            className="text-[12px] uppercase tracking-wide"
            style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
          >
            Plates for sale
          </Text>
          {draftPlates.map((plate, index) => (
            <View
              key={plate.id}
              className="rounded-xl border border-white/10 p-3"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  className="text-[12px] uppercase tracking-wide"
                  style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
                >
                  Plate {index + 1}
                </Text>
                <Pressable
                  onPress={() => onChangePlates(draftPlates.filter((p) => p.id !== plate.id))}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle-outline" size={20} color={cookTheme.textMuted} />
                </Pressable>
              </View>
              <PlatePhotoPicker
                imageUri={plate.imageUri}
                onPick={() => {
                  void pickPlatePhoto().then((picked) => {
                    if (!picked) return;
                    onChangePlates(
                      draftPlates.map((p) =>
                        p.id === plate.id
                          ? { ...p, imageUri: picked.uri, imageMime: picked.mimeType }
                          : p,
                      ),
                    );
                  });
                }}
              />
              <Field
                label="Plate name"
                value={plate.label}
                onChangeText={(v) =>
                  onChangePlates(
                    draftPlates.map((p) => (p.id === plate.id ? { ...p, label: v } : p)),
                  )
                }
                placeholder="Taste plate, Full plate…"
              />
              <Field
                label="Price ($)"
                value={plate.price}
                onChangeText={(v) =>
                  onChangePlates(
                    draftPlates.map((p) => (p.id === plate.id ? { ...p, price: v } : p)),
                  )
                }
                placeholder="12"
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      ) : null}

      {draftPlates.length < 5 ? (
        <Pressable
          onPress={() => onChangePlates([...draftPlates, newDraftPlate()])}
          className="mb-5 flex-row items-center justify-center rounded-2xl border border-dashed border-white/15 py-3.5"
          style={{ backgroundColor: cookTheme.surfaceElevated }}
        >
          <Ionicons name="add-circle-outline" size={20} color={cookTheme.accentSoft} />
          <Text className="ml-2 text-[14px] text-white" style={{ fontFamily: 'DMSans_500Medium' }}>
            Add plate
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

function draftPlatesHaveIncomplete(draftPlates: DraftPlate[]): boolean {
  return draftPlates.some(
    (p) => Boolean(p.label.trim() || p.price || p.imageUri) &&
      !(p.label.trim() && Number(p.price) > 0 && p.imageUri),
  );
}

function validPlatesFromDraft(draftPlates: DraftPlate[]) {
  return draftPlates
    .filter((p) => p.label.trim() && Number(p.price) > 0 && p.imageUri)
    .map((p, index) => ({
      label: p.label.trim(),
      description: p.description.trim(),
      price: Number(p.price),
      sort_order: index,
      imageUri: p.imageUri!,
      imageMime: p.imageMime,
      draftId: p.id,
    }));
}

async function uploadPlatesForPost(
  userId: string,
  postId: string,
  plates: ReturnType<typeof validPlatesFromDraft>,
) {
  const rows = await Promise.all(
    plates.map(async (plate) => ({
      label: plate.label,
      description: plate.description,
      price: plate.price,
      sort_order: plate.sort_order,
      image_url: await uploadPlateImage(userId, postId, plate.draftId, plate.imageUri, plate.imageMime),
    })),
  );
  await createPlatesForPost(postId, rows);
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
  const [draftPlates, setDraftPlates] = useState<DraftPlate[]>([]);

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
    if (draftPlatesHaveIncomplete(draftPlates)) {
      setError('Each plate needs a name, price, and photo.');
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
          status: 'published',
        })
        .eq('id', post.id);

      if (updateError) throw new Error(updateError.message);

      const validPlates = validPlatesFromDraft(draftPlates);
      if (validPlates.length) {
        await uploadPlatesForPost(user.id, post.id, validPlates);
      }

      setMessage('Short uploaded to Bunny! It may take a minute to process, then check For You and your profile.');
      setVideoUri(null);
      setTitle('');
      setDescription('');
      setDraftPlates([]);
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
    draftPlates,
  ]);

  const startLive = useCallback(async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('Add a title before going live.');
      return;
    }
    if (draftPlatesHaveIncomplete(draftPlates)) {
      setError('Each plate needs a name, price, and photo.');
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

      const validPlates = validPlatesFromDraft(draftPlates);
      if (validPlates.length) {
        await uploadPlatesForPost(user.id, post.id, validPlates);
      }

      setLiveSession({ postId: post.id, streamKey, rtmpUrl });
      setMessage('You are live! Neighbors can find you on For You.');
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
    draftPlates,
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
          Post a short or go live from your kitchen.
        </Text>

        <View
          className="mt-5 flex-row rounded-full p-1"
          style={{ backgroundColor: cookTheme.surfaceElevated }}
        >
          {(['short', 'live'] as const).map((tab) => {
            const active = mode === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  setMode(tab);
                  setError(null);
                  setDraftPlates([]);
                  if (tab === 'live') setVideoUri(null);
                }}
                className="flex-1 flex-row items-center justify-center rounded-full py-2.5"
                style={active ? { backgroundColor: cookTheme.accent } : undefined}
              >
                <Ionicons
                  name={tab === 'short' ? 'film-outline' : 'radio-outline'}
                  size={16}
                  color="#fff"
                />
                <Text
                  className="ml-1.5 text-[14px] text-white"
                  style={{ fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_500Medium' }}
                >
                  {tab === 'short' ? 'Post short' : 'Go live'}
                </Text>
              </Pressable>
            );
          })}
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

              <PlateEditorSection draftPlates={draftPlates} onChangePlates={setDraftPlates} />

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

              <PlateEditorSection draftPlates={draftPlates} onChangePlates={setDraftPlates} />

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
