import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { PlateOffering } from '../../types/live';

type Props = {
  plates: PlateOffering[];
  chefName: string;
  onSelectPlate: (plate: PlateOffering) => void;
};

export function PlatesBar({ plates, chefName, onSelectPlate }: Props) {
  if (!plates.length) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 px-3 py-2.5"
      style={{ backgroundColor: 'rgba(11, 11, 12, 0.92)' }}
    >
      <View className="mb-1.5 flex-row items-center">
        <Ionicons name="restaurant-outline" size={14} color={cookTheme.accentSoft} />
        <Text
          className="ml-1.5 text-[11px] uppercase tracking-wide"
          style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
        >
          Plates from {chefName}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {plates.map((plate) => (
          <Pressable
            key={plate.id}
            onPress={() => onSelectPlate(plate)}
            className="flex-row items-center rounded-xl border border-white/10 px-2 py-2"
            style={{ backgroundColor: cookTheme.surfaceElevated, maxWidth: 240 }}
          >
            {plate.imageUrl ? (
              <Image
                source={{ uri: plate.imageUrl }}
                className="mr-2 h-11 w-11 rounded-lg bg-white/10"
                resizeMode="cover"
              />
            ) : (
              <View
                className="mr-2 h-11 w-11 items-center justify-center rounded-lg bg-white/10"
              >
                <Ionicons name="restaurant-outline" size={18} color={cookTheme.textMuted} />
              </View>
            )}
            <View className="min-w-0 flex-1 pr-2">
              <Text
                className="text-[13px] text-white"
                style={{ fontFamily: 'DMSans_600SemiBold' }}
                numberOfLines={1}
              >
                {plate.label}
              </Text>
              {plate.description ? (
                <Text
                  className="mt-0.5 text-[10px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                  numberOfLines={1}
                >
                  {plate.description}
                </Text>
              ) : null}
            </View>
            <View className="rounded-lg px-2 py-1" style={{ backgroundColor: cookTheme.accent }}>
              <Text className="text-[12px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                ${plate.price}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
