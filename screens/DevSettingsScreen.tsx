import { StyleSheet, View } from 'react-native';
import { OwieButton } from '../components/owie/OwieButton';
import { OwieHeader } from '../components/owie/OwieHeader';
import type { OwieScreen } from './types';

type Props = { go: (s: OwieScreen) => void };

export function DevSettingsScreen({ go }: Props) {
  return (
    <>
      <OwieHeader title="Owie Developer Settings" subtitle="(NexusOwie-BLE)" />
      <View style={styles.p} />
      <OwieButton title="Wifi Configuration" onPress={() => go('wifi')} />
      <View style={styles.p} />
      <OwieButton title="Monitor BMS data" onPress={() => go('monitor')} />
      <View style={styles.p} />
      <OwieButton title="Back" onPress={() => go('settings')} />
    </>
  );
}

const styles = StyleSheet.create({ p: { height: 8 } });
