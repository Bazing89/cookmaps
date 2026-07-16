import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import type { CreatorPlate } from '../../types/creator';
import { fetchCreatorPlates } from '../../lib/plates';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  creatorId: string;
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
  maxSelected?: number;
  refreshKey?: number;
};

export function PlatePickerSection({
  creatorId,
  selectedIds,
  onChangeSelected,
  maxSelected = 5,
  refreshKey = 0,
}: Props) {
  const [plates, setPlates] = useState<CreatorPlate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlates(await fetchCreatorPlates(creatorId));
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const toggle = (plateId: string) => {
    if (selectedIds.includes(plateId)) {
      onChangeSelected(selectedIds.filter((id) => id !== plateId));
      return;
    }
    if (selectedIds.length >= maxSelected) return;
    onChangeSelected([...selectedIds, plateId]);
  };

  if (loading) {
    return (
      <View className="mb-5 items-center py-6">
        <ActivityIndicator color={cookTheme.accent} />
      </View>
    );
  }

  if (!plates.length) {
    return (
      <View
        className="mb-5 rounded-2xl border border-dashed border-white/15 px-4 py-5"
        style={{ backgroundColor: cookTheme.surfaceElevated }}
      >
        <Text className="text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
          No plates yet
        </Text>
        <Text
          className="mt-1 text-[12px] leading-5"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Create plates on your Profile → Plates tab, then attach them here when you post.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-5">
      <Text
        className="mb-2 text-[12px] uppercase tracking-wide"
        style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
      >
        Attach plates (optional)
      </Text>
      <Text
        className="mb-3 text-[12px]"
        style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
      >
        Select up to {maxSelected} plates from your catalog to sell with this post.
      </Text>
      <View className="gap-2">
        {plates.map((plate) => {
          const selected = selectedIds.includes(plate.id);
          return (
            <Pressable
              key={plate.id}
              onPress={() => toggle(plate.id)}
              className="flex-row items-center rounded-xl border px-3 py-2.5"
              style={{
                backgroundColor: selected ? 'rgba(255, 107, 53, 0.12)' : cookTheme.surfaceElevated,
                borderColor: selected ? cookTheme.accent : 'rgba(255,255,255,0.1)',
              }}
            >
              {plate.image_url ? (
                <Image
                  source={{ uri: plate.image_url }}
                  className="mr-3 h-12 w-12 rounded-lg bg-white/10"
                  resizeMode="cover"
                />
              ) : (
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <Ionicons name="restaurant-outline" size={18} color={cookTheme.textMuted} />
                </View>
              )}
              <View className="min-w-0 flex-1">
                <Text
                  className="text-[14px] text-white"
                  style={{ fontFamily: 'DMSans_600SemiBold' }}
                  numberOfLines={1}
                >
                  {plate.name}
                </Text>
                <Text
                  className="mt-0.5 text-[11px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                  numberOfLines={1}
                >
                  ${Number(plate.price)} · {plate.ingredients}
                </Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selected ? cookTheme.accent : cookTheme.textMuted}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
