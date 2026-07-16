import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { cookTheme } from '../../theme/cookTheme';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  trailing?: ReactNode;
  subtitle?: string;
  destructive?: boolean;
};

export function SettingsRow({ label, icon, onPress, trailing, subtitle, destructive }: Props) {
  const content = (
    <View
      className="flex-row items-center rounded-2xl border border-white/10 px-4 py-3.5"
      style={{ backgroundColor: cookTheme.surfaceElevated }}
    >
      <View
        className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: destructive ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.06)' }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? cookTheme.live : cookTheme.textMuted}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="text-[15px]"
          style={{
            fontFamily: 'DMSans_500Medium',
            color: destructive ? cookTheme.live : '#fff',
          }}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            className="mt-0.5 text-[12px]"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={cookTheme.textMuted} /> : null)}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      {content}
    </Pressable>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SectionProps) {
  return (
    <View className="mt-6">
      <Text
        className="mb-2 px-1 text-[11px] uppercase tracking-wider"
        style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
      >
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}
