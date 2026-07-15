import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onBack: () => void;
  onSettingsPress: () => void;
};

export function DataHeader({ title, onBack, onSettingsPress }: Props) {
  return (
    <View className="mb-3 w-full flex-row items-center border-b border-zinc-800/90 pb-3">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityLabel="Back to connection"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-800"
      >
        <Ionicons name="chevron-back" size={24} color="#fafafa" />
      </Pressable>
      <Text
        className="flex-1 px-2 text-center text-lg font-semibold text-zinc-50"
        numberOfLines={1}
      >
        {title}
      </Text>
      <Pressable
        onPress={onSettingsPress}
        hitSlop={12}
        accessibilityLabel="App settings"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-800"
      >
        <Ionicons name="settings-outline" size={24} color="#fafafa" />
      </Pressable>
    </View>
  );
}
