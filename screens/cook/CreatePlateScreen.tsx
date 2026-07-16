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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { createCreatorPlate } from '../../lib/plates';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  onBack: () => void;
  onCreated?: () => void;
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

export function CreatePlateScreen({ onBack, onCreated }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add a plate picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return;
    setImageUri(result.assets[0].uri);
    setImageMime(result.assets[0].mimeType ?? 'image/jpeg');
  }, []);

  const save = useCallback(async () => {
    if (!user) return;
    if (!name.trim()) {
      setError('Add a name for your plate.');
      return;
    }
    if (!ingredients.trim()) {
      setError('List the ingredients.');
      return;
    }
    if (!description.trim()) {
      setError('Add a short description.');
      return;
    }
    if (!Number(price) || Number(price) <= 0) {
      setError('Set a price greater than $0.');
      return;
    }
    if (!imageUri) {
      setError('Add a photo of the plate.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await createCreatorPlate(
        user.id,
        {
          name: name.trim(),
          ingredients: ingredients.trim(),
          description: description.trim(),
          price: Number(price),
        },
        imageUri,
        imageMime,
      );
      onCreated?.();
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save plate');
    } finally {
      setBusy(false);
    }
  }, [description, imageMime, imageUri, ingredients, name, onBack, onCreated, price, user]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: cookTheme.bg }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-4 pb-2 pt-1">
          <Pressable
            onPress={onBack}
            hitSlop={12}
            className="mr-2 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: cookTheme.surfaceElevated }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text className="flex-1 text-[20px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Create plate
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="mb-4 text-[13px] leading-5"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Plates you create show on your profile and can be attached when you post a short or go live.
          </Text>

          <Pressable
            onPress={() => void pickPhoto()}
            className="mb-4 overflow-hidden rounded-2xl border border-dashed border-white/20"
            style={{ backgroundColor: cookTheme.surface, height: 180 }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons name="camera-outline" size={32} color={cookTheme.accentSoft} />
                <Text
                  className="mt-2 text-[14px] text-white"
                  style={{ fontFamily: 'DMSans_600SemiBold' }}
                >
                  Add plate photo
                </Text>
                <Text
                  className="mt-1 text-center text-[12px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  Required · show what buyers will get
                </Text>
              </View>
            )}
          </Pressable>

          <Field label="Plate name" value={name} onChangeText={setName} placeholder="Smoked brisket plate" />
          <Field
            label="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Brisket, rice, pickled onions, house sauce…"
            multiline
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What makes this plate special?"
            multiline
          />
          <Field
            label="Price ($)"
            value={price}
            onChangeText={setPrice}
            placeholder="18"
            keyboardType="numeric"
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
            onPress={() => void save()}
            disabled={busy}
            className="flex-row items-center justify-center rounded-2xl py-3.5"
            style={{ backgroundColor: cookTheme.accent, opacity: busy ? 0.7 : 1 }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={20} color="#fff" />
                <Text className="ml-2 text-[15px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                  Save plate
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
