import { type ReactNode } from 'react';
import { View } from 'react-native';

type Props = { children: ReactNode };

/** Framed content area — Tailwind / NativeWind. */
export function AppShell({ children }: Props) {
  return (
    <View className="min-h-0 w-full max-w-[640px] flex-1 self-center rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/50">
      {children}
    </View>
  );
}
