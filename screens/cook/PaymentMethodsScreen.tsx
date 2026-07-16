import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SettingsSection } from '../../components/cook/SettingsRow';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  onBack: () => void;
};

export function PaymentMethodsScreen({ onBack }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: cookTheme.bg }}>
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
          Payment methods
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
        <View
          className="mt-4 items-center rounded-3xl border border-white/10 px-5 py-10"
          style={{ backgroundColor: cookTheme.surface }}
        >
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: cookTheme.surfaceElevated }}
          >
            <Ionicons name="card-outline" size={28} color={cookTheme.textMuted} />
          </View>
          <Text
            className="mt-4 text-[17px] text-white"
            style={{ fontFamily: 'Syne_700Bold' }}
          >
            No cards saved yet
          </Text>
          <Text
            className="mt-2 text-center text-[13px] leading-5"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Add a debit or credit card to claim plates faster at checkout.
          </Text>
        </View>

        <SettingsSection title="Saved cards">
          <Text
            className="px-1 text-[13px] leading-5"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Your payment methods will appear here once Stripe is connected.
          </Text>
        </SettingsSection>

        <Pressable
          className="mt-6 flex-row items-center justify-center rounded-2xl py-3.5"
          style={{ backgroundColor: cookTheme.accent, opacity: 0.55 }}
          disabled
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text
            className="ml-1 text-[15px] text-white"
            style={{ fontFamily: 'DMSans_600SemiBold' }}
          >
            Add payment method
          </Text>
        </Pressable>
        <Text
          className="mt-2 text-center text-[11px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Coming soon — secure payments via Stripe
        </Text>
      </ScrollView>
    </View>
  );
}
