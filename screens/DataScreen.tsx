import type { ComponentProps } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OwieBleConnectionState } from '../lib/owieBleTransport';
import {
  formatCurrent,
  formatInteger,
  formatTemps,
  formatVoltage,
  type OwieStatus,
} from '../lib/parseOwieStatus';

type IconName = ComponentProps<typeof Ionicons>['name'];

const DEMO = {
  totalVoltage: 55.0,
  currentAmps: 0.0,
  bmsSoc: 87,
  overriddenSoc: 85,
  usedMah: 120,
  regen: 0,
  uptime: '12m 0s',
  temps: '22°C / 23°C',
  cells: [4.12, 4.1, 4.11, 4.09],
} as const;

type Props = {
  subtitle?: string;
  status?: OwieStatus | null;
  connectionState?: OwieBleConnectionState;
  error?: string | null;
  isDemo?: boolean;
};

function MiniStat({
  icon,
  label,
  value,
  unit,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <View className="min-w-[47%] flex-1 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <View className="mb-2 flex-row items-center">
        <Ionicons name={icon} size={18} color="#a1a1aa" />
        <Text className="ml-2 text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-bold text-zinc-50">{value}</Text>
        {unit ? <Text className="ml-1 text-base font-medium text-zinc-400">{unit}</Text> : null}
      </View>
    </View>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-zinc-800/60 py-3 last:border-b-0">
      <Text className="text-sm text-zinc-500">{label}</Text>
      <Text className="max-w-[55%] text-right text-sm font-medium text-zinc-100">{value}</Text>
    </View>
  );
}

export function DataScreen({ subtitle, status, connectionState = 'idle', error, isDemo }: Props) {
  const showDemo = Boolean(isDemo);
  const live = !showDemo && status != null;

  const overriddenSoc = showDemo ? DEMO.overriddenSoc : status?.overriddenSoc ?? null;
  const bmsSoc = showDemo ? DEMO.bmsSoc : status?.bmsSoc ?? null;
  const soc = overriddenSoc ?? 0;
  const socWidth = Math.min(100, Math.max(0, soc));

  const totalVoltage = showDemo ? DEMO.totalVoltage : status?.totalVoltage ?? null;
  const currentAmps = showDemo ? DEMO.currentAmps : status?.currentAmps ?? null;
  const usedMah = showDemo ? DEMO.usedMah : status?.usedChargeMah ?? null;
  const regen = showDemo ? DEMO.regen : status?.regeneratedChargeMah ?? null;
  const uptime = showDemo ? DEMO.uptime : status?.uptime ?? null;
  const cells = showDemo ? DEMO.cells : status?.cellVoltages ?? [];
  const temps = showDemo ? DEMO.temps : formatTemps(status?.temperatures ?? []);

  const waitingForData =
    !showDemo && connectionState === 'connected' && !status && !error;

  return (
    <ScrollView
      className="w-full flex-1"
      contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      <View className="w-full gap-4">
        {subtitle ? (
          <View className="self-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5">
            <Text className="text-center text-xs font-medium text-zinc-400">{subtitle}</Text>
          </View>
        ) : null}

        {error ? (
          <View className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3">
            <Text className="text-center text-sm text-red-300">{error}</Text>
          </View>
        ) : null}

        {waitingForData ? (
          <View className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <Text className="text-center text-sm text-zinc-400">Connected — waiting for device data…</Text>
          </View>
        ) : null}

        <View className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <Text className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
            State of charge
          </Text>
          <View className="flex-row items-baseline justify-center pt-1">
            <Text className="text-6xl font-extrabold text-white">{formatInteger(overriddenSoc)}</Text>
            <Text className="text-3xl text-zinc-500">%</Text>
          </View>
          <Text className="pb-3 text-center text-sm text-zinc-500">
            BMS reported {formatInteger(bmsSoc)}%
          </Text>
          <View className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <View className="h-full rounded-full bg-zinc-100" style={{ width: `${socWidth}%` }} />
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <MiniStat
            icon="flash-outline"
            label="Pack voltage"
            value={formatVoltage(totalVoltage)}
            unit="V"
          />
          <MiniStat icon="pulse-outline" label="Current" value={formatCurrent(currentAmps)} unit="A" />
        </View>

        <View className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Energy</Text>
          <View className="flex-row justify-between gap-2">
            <View className="flex-1 rounded-lg bg-zinc-950/80 p-3">
              <Text className="text-xs text-zinc-500">Used</Text>
              <Text className="text-lg font-semibold text-zinc-100">{formatInteger(usedMah)} mAh</Text>
            </View>
            <View className="flex-1 rounded-lg bg-zinc-950/80 p-3">
              <Text className="text-xs text-zinc-500">Regen</Text>
              <Text className="text-lg font-semibold text-zinc-100">{formatInteger(regen)} mAh</Text>
            </View>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cell voltages
          </Text>
          {cells.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {cells.map((v, i) => (
                <View
                  key={i}
                  className="w-[23%] min-w-[22%] items-center rounded-lg border border-zinc-800 bg-zinc-900 py-2.5"
                >
                  <Text className="text-base font-bold text-zinc-100">{formatVoltage(v, 2)}v</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-zinc-500">
              {live || waitingForData ? 'No cell data yet' : '—'}
            </Text>
          )}
        </View>

        <View className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4">
          <RowItem label="BMS reported SOC" value={`${formatInteger(bmsSoc)}%`} />
          <RowItem label="Uptime" value={uptime ?? '—'} />
          <RowItem label="Battery / BMS temps" value={temps} />
        </View>

        <Text className="text-center text-xs text-zinc-600">
          Nexus Owie {showDemo ? '· demo data' : live ? '· live BLE' : ''}
        </Text>
      </View>
    </ScrollView>
  );
}
