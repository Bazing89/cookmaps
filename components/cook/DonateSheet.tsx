import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { DONATION_TIERS } from '../../data/lives';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream, PlateOffering } from '../../types/live';

type Props = {
  visible: boolean;
  stream: LiveStream | null;
  onClose: () => void;
  onAddToCart: (plate: PlateOffering) => void;
};

export function DonateSheet({ visible, stream, onClose, onAddToCart }: Props) {
  if (!stream) return null;

  const tiers: PlateOffering[] = stream.plates?.length
    ? stream.plates
    : DONATION_TIERS.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.perks,
        price: t.amount,
        imageUrl: null,
      }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/75" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl px-5 pb-8 pt-4"
          style={{ backgroundColor: cookTheme.surface }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-1 w-10 rounded-full bg-white/20" />
            <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
              Add a plate
            </Text>
            <Text
              className="mt-1 text-center text-[13px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              From {stream.chefName} · pick up at {stream.pickupNeighborhood || 'nearby'}
            </Text>
          </View>

          {tiers.map((plate) => (
            <View
              key={plate.id}
              className="mb-3 rounded-2xl border border-white/10 px-3 py-3"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <View className="flex-row items-center">
                {plate.imageUrl ? (
                  <Image
                    source={{ uri: plate.imageUrl }}
                    className="mr-3 h-14 w-14 rounded-xl bg-white/10"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                    <Ionicons name="restaurant-outline" size={22} color={cookTheme.textMuted} />
                  </View>
                )}
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="text-[16px] text-white" style={{ fontFamily: 'Syne_700Bold' }}>
                    {plate.label}
                  </Text>
                  {plate.description ? (
                    <Text
                      className="mt-0.5 text-[12px]"
                      style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                      numberOfLines={2}
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
                onPress={() => {
                  onAddToCart(plate);
                  onClose();
                }}
                className="mt-3 flex-row items-center justify-center rounded-xl py-2.5"
                style={{ backgroundColor: cookTheme.accent }}
              >
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text className="ml-2 text-[14px] text-white" style={{ fontFamily: 'DMSans_600SemiBold' }}>
                  Order now
                </Text>
              </Pressable>
            </View>
          ))}

          <View className="mt-1 flex-row items-start gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Ionicons name="cart-outline" size={16} color={cookTheme.accentSoft} />
            <Text
              className="flex-1 text-[12px] leading-4"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Plates go to your Cart. Place the order when you are ready — pickup details unlock on the Map tab.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
