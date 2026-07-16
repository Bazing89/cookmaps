import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';
import type { PlateOffering } from '../../types/live';

type Props = {
  plates: PlateOffering[];
  chefName: string;
  onAddToCart: (plate: PlateOffering) => void;
  onClose: () => void;
};

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

function PlateCard({
  plate,
  fullWidth,
  onAddToCart,
}: {
  plate: PlateOffering;
  fullWidth?: boolean;
  onAddToCart: () => void;
}) {
  return (
    <View
      className={`rounded-xl border border-white/10 px-3 py-3 ${fullWidth ? 'w-full' : ''}`}
      style={{
        backgroundColor: cookTheme.surfaceElevated,
        maxWidth: fullWidth ? undefined : 280,
      }}
    >
      <View className="flex-row items-center">
        {plate.imageUrl ? (
          <Image
            source={{ uri: plate.imageUrl }}
            className={`mr-3 rounded-lg bg-white/10 ${fullWidth ? 'h-16 w-16' : 'h-14 w-14'}`}
            resizeMode="cover"
          />
        ) : (
          <View
            className={`mr-3 items-center justify-center rounded-lg bg-white/10 ${fullWidth ? 'h-16 w-16' : 'h-14 w-14'}`}
          >
            <Ionicons name="restaurant-outline" size={fullWidth ? 24 : 20} color={cookTheme.textMuted} />
          </View>
        )}
        <View className="min-w-0 flex-1 pr-2">
          <Text
            className={`text-white ${fullWidth ? 'text-[16px]' : 'text-[14px]'}`}
            style={{ fontFamily: 'DMSans_600SemiBold' }}
            numberOfLines={1}
          >
            {plate.label}
          </Text>
          {plate.description ? (
            <Text
              className="mt-0.5 text-[12px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
              numberOfLines={fullWidth ? 2 : 1}
            >
              {plate.description}
            </Text>
          ) : null}
          <Text
            className="mt-1 text-[14px] text-white"
            style={{ fontFamily: 'DMSans_600SemiBold' }}
          >
            ${plate.price}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onAddToCart}
        className="mt-3 flex-row items-center justify-center rounded-xl py-2.5"
        style={{ backgroundColor: cookTheme.accent }}
      >
        <Ionicons name="cart-outline" size={16} color="#fff" />
        <Text className="ml-2 text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
          Order now
        </Text>
      </Pressable>
    </View>
  );
}

function CollapsedChip({ plate }: { plate: PlateOffering }) {
  return (
    <>
      {plate.imageUrl ? (
        <Image source={{ uri: plate.imageUrl }} className="mr-2 h-9 w-9 rounded-lg bg-white/10" resizeMode="cover" />
      ) : (
        <View className="mr-2 h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Ionicons name="restaurant-outline" size={16} color={cookTheme.textMuted} />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text
          className="text-[13px] text-white"
          style={{ fontFamily: 'DMSans_600SemiBold', ...textShadow }}
          numberOfLines={1}
        >
          {plate.label}
        </Text>
        <Text className="text-[12px] text-white/90" style={{ fontFamily: 'DMSans_500Medium', ...textShadow }}>
          ${plate.price}
        </Text>
      </View>
    </>
  );
}

export function PlatesBar({ plates, chefName, onAddToCart, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [plates, chefName]);

  if (!plates.length) return null;

  const single = plates.length === 1;
  const primary = plates[0];

  const handleAddToCart = (plate: PlateOffering) => {
    onAddToCart(plate);
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <View className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-2" pointerEvents="box-none">
        <View
          className="flex-row items-center rounded-xl border border-white/15 pr-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}
        >
          <Pressable
            onPress={() => setExpanded(true)}
            className="min-w-0 flex-1 flex-row items-center px-2.5 py-2"
            accessibilityLabel="View plates"
          >
            {single ? (
              <CollapsedChip plate={primary} />
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="max-w-[55%]"
                  contentContainerStyle={{ alignItems: 'center', paddingRight: 8 }}
                >
                  {plates.map((plate) =>
                    plate.imageUrl ? (
                      <Image
                        key={plate.id}
                        source={{ uri: plate.imageUrl }}
                        className="mr-1.5 h-9 w-9 rounded-lg bg-white/10"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        key={plate.id}
                        className="mr-1.5 h-9 w-9 items-center justify-center rounded-lg bg-white/10"
                      >
                        <Ionicons name="restaurant-outline" size={14} color={cookTheme.textMuted} />
                      </View>
                    ),
                  )}
                </ScrollView>
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[13px] text-white"
                    style={{ fontFamily: 'DMSans_600SemiBold', ...textShadow }}
                    numberOfLines={1}
                  >
                    {plates.length} plates · {chefName}
                  </Text>
                  <Text
                    className="text-[11px] text-white/85"
                    style={{ fontFamily: 'DMSans_400Regular', ...textShadow }}
                    numberOfLines={1}
                  >
                    From ${Math.min(...plates.map((p) => p.price))}
                  </Text>
                </View>
              </>
            )}
            <Ionicons name="chevron-up" size={16} color="#fff" style={{ marginLeft: 8 }} />
          </Pressable>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            accessibilityLabel="Hide plates"
          >
            <Ionicons name="close" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="absolute inset-0 z-20 justify-end" pointerEvents="box-none">
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onPress={() => setExpanded(false)}
        accessibilityLabel="Close plates"
      />

      <View
        className="rounded-t-3xl border-t border-white/10 px-4 pb-4 pt-3"
        style={{ backgroundColor: cookTheme.surface }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center pr-2">
            <Ionicons name="restaurant-outline" size={16} color={cookTheme.accentSoft} />
            <Text
              className="ml-2 text-[13px] uppercase tracking-wide text-white"
              style={{ fontFamily: 'DMSans_600SemiBold' }}
              numberOfLines={1}
            >
              Plates from {chefName}
            </Text>
          </View>
          <Pressable
            onPress={() => setExpanded(false)}
            hitSlop={10}
            accessibilityLabel="Close plates"
            className="h-8 w-8 items-center justify-center rounded-full border border-white/15"
            style={{ backgroundColor: cookTheme.surfaceElevated }}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>
        </View>

        {single ? (
          <PlateCard plate={plates[0]} fullWidth onAddToCart={() => handleAddToCart(plates[0])} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {plates.map((plate) => (
              <PlateCard key={plate.id} plate={plate} onAddToCart={() => handleAddToCart(plate)} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
