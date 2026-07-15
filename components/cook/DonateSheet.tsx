import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { DONATION_TIERS } from '../../data/lives';
import { cookTheme } from '../../theme/cookTheme';
import type { LiveStream } from '../../types/live';

type Props = {
  visible: boolean;
  stream: LiveStream | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
};

export function DonateSheet({ visible, stream, onClose, onConfirm }: Props) {
  if (!stream) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/55" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl px-5 pb-8 pt-4"
          style={{ backgroundColor: cookTheme.surface }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-1 w-10 rounded-full bg-white/20" />
            <Text
              className="text-[22px] text-white"
              style={{ fontFamily: 'Syne_700Bold' }}
            >
              Claim a plate
            </Text>
            <Text
              className="mt-1 text-center text-[13px]"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Donate to {stream.chefName} · pick up at {stream.pickupNeighborhood}
            </Text>
          </View>

          {DONATION_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              onPress={() => onConfirm(tier.amount)}
              className="mb-3 flex-row items-center justify-between rounded-2xl border border-white/10 px-4 py-3.5"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              <View className="flex-1 pr-3">
                <Text
                  className="text-[16px] text-white"
                  style={{ fontFamily: 'Syne_700Bold' }}
                >
                  {tier.label}
                </Text>
                <Text
                  className="mt-0.5 text-[12px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  {tier.perks}
                </Text>
              </View>
              <View
                className="rounded-full px-3.5 py-2"
                style={{ backgroundColor: cookTheme.accent }}
              >
                <Text
                  className="text-[14px] text-white"
                  style={{ fontFamily: 'DMSans_600SemiBold' }}
                >
                  ${tier.amount}
                </Text>
              </View>
            </Pressable>
          ))}

          <View className="mt-1 flex-row items-start gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Ionicons name="navigate-outline" size={16} color={cookTheme.accentSoft} />
            <Text
              className="flex-1 text-[12px] leading-4"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              After you donate, your plate unlocks on the Map tab with pickup pin and ETA.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
