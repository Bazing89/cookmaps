import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
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
import { displayHandle } from '../../lib/creatorPosts';
import { isProfileSetupIncomplete, normalizeHandle, updateUserProfile, uploadProfileAvatar } from '../../lib/profiles';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  onBack: () => void;
};

function profileInitial(displayName: string | null | undefined, email: string | null | undefined) {
  const source = displayName?.trim() || email?.trim() || '?';
  return source.charAt(0).toUpperCase();
}

export function EditProfileScreen({ onBack }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [pendingAvatarMime, setPendingAvatarMime] = useState('image/jpeg');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? user?.email?.split('@')[0] ?? '');
    setHandle(profile?.handle ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUri(profile?.avatar_url ?? null);
    setPendingAvatarUri(null);
  }, [profile, user?.email]);

  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingAvatarUri(result.assets[0].uri);
      setPendingAvatarMime(result.assets[0].mimeType ?? 'image/jpeg');
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const onSave = useCallback(async () => {
    if (!user) return;
    if (!displayName.trim()) {
      setError('Add a display name.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let nextAvatarUrl = profile?.avatar_url ?? null;
      if (pendingAvatarUri) {
        nextAvatarUrl = await uploadProfileAvatar(user.id, pendingAvatarUri, pendingAvatarMime);
      }

      await updateUserProfile(user.id, {
        display_name: displayName,
        handle: normalizeHandle(handle),
        bio,
        avatar_url: nextAvatarUrl,
      });

      await refreshProfile();
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }, [
    bio,
    displayName,
    handle,
    onBack,
    pendingAvatarMime,
    pendingAvatarUri,
    profile?.avatar_url,
    refreshProfile,
    user,
  ]);

  const previewHandle = handle.trim()
    ? `@${normalizeHandle(handle)}`
    : profile
      ? displayHandle(profile)
      : '@neighbor';

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: cookTheme.surfaceElevated }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
          Edit profile
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {isProfileSetupIncomplete(profile) ? (
          <View
            className="mb-5 rounded-2xl border border-white/10 px-4 py-3"
            style={{ backgroundColor: cookTheme.surfaceElevated }}
          >
            <Text className="text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Finish setting up your account
            </Text>
            <Text
              className="mt-1 text-[12px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Add a profile photo and display name so neighbors recognize you.
            </Text>
          </View>
        ) : null}

        <View className="mb-6 items-center">
          <Pressable onPress={() => void pickAvatar()} className="relative">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="h-24 w-24 rounded-full"
                style={{ backgroundColor: cookTheme.surfaceElevated }}
              />
            ) : (
              <View
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: cookTheme.accent }}
              >
                <Text className="text-[32px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
                  {profileInitial(displayName, profile?.email ?? user?.email)}
                </Text>
              </View>
            )}
            <View
              className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2"
              style={{ backgroundColor: cookTheme.surface, borderColor: cookTheme.bg }}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Pressable onPress={() => void pickAvatar()} className="mt-3">
            <Text className="text-[13px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Change photo
            </Text>
          </Pressable>
        </View>

        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Maya Chen" />
        <Field
          label="Handle"
          value={handle}
          onChangeText={setHandle}
          placeholder="mayafires"
          autoCapitalize="none"
        />
        <Text
          className="-mt-2 mb-4 text-[12px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Your public handle: {previewHandle}
        </Text>
        <Field
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Home cook in the Mission…"
          multiline
        />

        {error ? (
          <Text
            className="mb-3 text-[13px]"
            style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.live }}
          >
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void onSave()}
          disabled={busy}
          className="flex-row items-center justify-center rounded-2xl py-3.5"
          style={{ backgroundColor: cookTheme.accent, opacity: busy ? 0.7 : 1 }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Save profile
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
        autoCapitalize={autoCapitalize}
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
