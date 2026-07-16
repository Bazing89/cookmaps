import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  title: string;
  body: string;
  onBack: () => void;
};

export function LegalDocumentScreen({ title, body, onBack }: Props) {
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
        <Text
          className="flex-1 text-[22px] text-white"
          style={{ fontFamily: 'Syne_800ExtraBold' }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <View
          className="mt-4 rounded-3xl border border-white/10 px-5 py-5"
          style={{ backgroundColor: cookTheme.surface }}
        >
          <Text
            className="text-[14px] leading-6"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            {body}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
