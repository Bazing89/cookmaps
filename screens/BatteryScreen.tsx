import { StyleSheet, Text, View } from 'react-native';
import { StatRow } from '../components/owie/StatRow';
import { OwieButton } from '../components/owie/OwieButton';
import { OwieCard } from '../components/owie/OwieCard';
import { OwieHeader } from '../components/owie/OwieHeader';
import type { OwieScreen } from './types';

const M = {
  soc: '85',
  vSoc: '84',
  lowSoc: '10',
  highSoc: '100',
  rangeMah: '2500',
  depthMah: '300',
} as const;

type Props = { go: (s: OwieScreen) => void };

export function BatteryScreen({ go }: Props) {
  return (
    <>
      <OwieHeader title="Owie Battery" />
      <OwieCard>
        <StatRow label="SOC" value={`${M.soc}%`} />
        <StatRow label="Voltage based SOC" value={`${M.vSoc}%`} />
        <StatRow label="Lowest Ah-tracked SOC" value={`${M.lowSoc}%`} />
        <StatRow label="Highest Ah-tracked SOC" value={`${M.highSoc}%`} />
        <StatRow label="Ah-tracked range size" value={`${M.rangeMah} mAh`} />
        <StatRow label="Current discharge depth" value={`${M.depthMah} mAh`} />
      </OwieCard>
      <View style={styles.p} />
      <OwieButton title="Reset stats" onPress={() => {}} />
      <View style={styles.p} />
      <OwieButton title="Reset Settings" onPress={() => {}} />
      <View style={styles.p} />
      <OwieButton title="Back" onPress={() => go('status')} />
    </>
  );
}

const styles = StyleSheet.create({
  p: { height: 8 },
});
