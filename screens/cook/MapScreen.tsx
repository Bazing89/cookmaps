import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { ClaimedPlate } from './types';

type Props = {
  plates: ClaimedPlate[];
};

export function MapScreen({ plates }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
      <View className="relative flex-1 overflow-hidden">
        {/* Stylized map plane — pickup pins will wire to real maps later */}
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: '#14181C',
          }}
        />
        <View
          className="absolute inset-0 opacity-40"
          style={{
            backgroundColor: 'transparent',
            borderWidth: 0,
          }}
        />
        {/* Grid suggestion */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{ top: `${(i + 1) * 11}%` as `${number}%` }}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-l border-white/5"
            style={{ left: `${(i + 1) * 14}%` as `${number}%` }}
          />
        ))}

        <View className="absolute left-6 top-8 right-6">
          <Text className="text-[28px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Pickup map
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Chefs you’ve backed show up here for walk-up pickup.
          </Text>
        </View>

        {plates.length === 0 ? (
          <View className="absolute inset-0 items-center justify-center px-8">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <Ionicons name="navigate" size={28} color={cookTheme.accent} />
            </View>
            <Text
              className="mt-4 text-center text-[16px] text-white"
              style={{ fontFamily: 'Syne_700Bold' }}
            >
              No plates claimed yet
            </Text>
            <Text
              className="mt-2 text-center text-[13px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Swipe Live, donate to a chef, and your pickup pin drops on this map.
            </Text>
          </View>
        ) : (
          plates.map((plate, index) => (
            <View
              key={plate.id}
              className="absolute items-center"
              style={{
                top: `${28 + index * 14}%` as `${number}%`,
                left: `${18 + (index % 3) * 22}%` as `${number}%`,
              }}
            >
              <View className="overflow-hidden rounded-full border-2 border-white">
                <Image source={{ uri: plate.stream.chefAvatar }} className="h-11 w-11" />
              </View>
              <View
                className="mt-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: cookTheme.accent }}
              >
                <Text
                  className="text-[10px] text-white"
                  style={{ fontFamily: 'DMSans_600SemiBold' }}
                >
                  ${plate.amount}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {plates.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="absolute bottom-4 left-0 right-0"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {plates.map((plate) => (
            <View
              key={plate.id}
              className="w-64 rounded-2xl border border-white/10 px-3.5 py-3"
              style={{ backgroundColor: cookTheme.surface }}
            >
              <Text className="text-[14px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                {plate.stream.dishName}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              >
                {plate.stream.pickupAddress}
              </Text>
              <Text
                className="mt-2 text-[12px]"
                style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.accentSoft }}
              >
                Ready in ~{plate.stream.readyInMinutes}m · ${plate.amount} donated
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
