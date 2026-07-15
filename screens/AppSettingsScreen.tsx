import { useState } from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const PRIVACY = `Privacy policy (placeholder)

This app connects to your hardware over Bluetooth. We do not sell your data. Analytics and crash reporting, if added later, will be described here.

Data collected: device connection state on your phone only, unless you opt in to additional features.`;

const TERMS = `Terms of use (placeholder)

Use this app at your own risk with compatible hardware. The authors are not liable for damage or injury. Read your board documentation before use.`;

type Props = {
  onBack: () => void;
  onDisconnect: () => void;
};

export function AppSettingsScreen({ onBack, onDisconnect }: Props) {
  const v = Constants.expoConfig?.version ?? '1.0.0';
  const [notif, setNotif] = useState(true);
  const [expanded, setExpanded] = useState<null | 'privacy' | 'terms'>(null);

  return (
    <View className="w-full flex-1">
      <View className="mb-3 flex-row items-center justify-between border-b border-zinc-800 pb-3">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-800"
        >
          <Ionicons name="chevron-back" size={26} color="#fafafa" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-zinc-50" numberOfLines={1}>
          Settings
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="w-full flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">General</Text>
        <View className="mb-5 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <Text className="flex-1 text-base text-zinc-100">Push notifications (future)</Text>
          <Switch
            value={notif}
            onValueChange={setNotif}
            trackColor={{ true: '#3f3f46', false: '#27272a' }}
            thumbColor={notif ? '#fafafa' : '#71717a'}
          />
        </View>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Legal & information
        </Text>
        <Pressable
          className="mb-1 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 active:bg-zinc-800"
          onPress={() => setExpanded((e) => (e === 'privacy' ? null : 'privacy'))}
        >
          <Text className="flex-1 text-base text-zinc-100">Privacy policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </Pressable>
        {expanded === 'privacy' ? (
          <Text className="mb-3 ml-0.5 text-sm leading-5 text-zinc-500">{PRIVACY}</Text>
        ) : null}

        <Pressable
          className="mb-1 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 active:bg-zinc-800"
          onPress={() => setExpanded((e) => (e === 'terms' ? null : 'terms'))}
        >
          <Text className="flex-1 text-base text-zinc-100">Terms of service</Text>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </Pressable>
        {expanded === 'terms' ? (
          <Text className="mb-3 ml-0.5 text-sm leading-5 text-zinc-500">{TERMS}</Text>
        ) : null}

        <Pressable
          className="mb-2 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 active:bg-zinc-800"
          onPress={() => {
            void Linking.openURL('https://expo.dev/support').catch(() => undefined);
          }}
        >
          <Text className="flex-1 text-base text-zinc-100">Help & support</Text>
          <Ionicons name="open-outline" size={20} color="#71717a" />
        </Pressable>
        <Pressable className="mb-2 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
          <Text className="flex-1 text-base text-zinc-100">Open-source licenses</Text>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </Pressable>
        <View className="mb-4 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5">
          <Text className="text-base text-zinc-100">App version</Text>
          <Text className="text-base text-zinc-500">{v}</Text>
        </View>

        <Pressable
          onPress={onDisconnect}
          className="w-full items-center justify-center rounded-xl border border-red-500/50 bg-red-500/20 py-3.5 active:bg-red-500/30"
        >
          <Text className="text-base font-semibold text-red-300">Disconnect & forget device</Text>
        </Pressable>
        <Text className="mt-3 text-center text-xs leading-5 text-zinc-500">
          Disconnect stops the BLE session. You can scan again on the home screen. Demo mode is not affected.
        </Text>
      </ScrollView>
    </View>
  );
}
