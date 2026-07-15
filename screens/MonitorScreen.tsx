import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { OwieButton } from '../components/owie/OwieButton';
import { OwieCard } from '../components/owie/OwieCard';
import { OwieHeader } from '../components/owie/OwieHeader';
import { bodyFont, owie } from '../theme/owieTheme';
import type { OwieScreen } from './types';

const mono = Platform.select({
  web: 'Consolas, monaco, monospace',
  default: 'monospace',
});

type Props = { go: (s: OwieScreen) => void };

export function MonitorScreen({ go }: Props) {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState('Connect to see BMS hex stream (device WebSocket not wired here).\n');

  return (
    <>
      <OwieHeader title="Owie BMS data monitor" subtitle="(NexusOwie-BLE)" />
      <TextInput
        style={[styles.term, { fontFamily: mono }]}
        multiline
        editable={false}
        value={log}
        onChangeText={setLog}
        scrollEnabled
      />
      <OwieButton
        title={running ? 'Stop' : 'Connect'}
        onPress={() => {
          setRunning(!running);
          setLog((prev) =>
            running ? prev + '\n[stopped]' : prev + '\n[mock: connect would open ws://…/rawdata]',
          );
        }}
      />
      <View style={styles.row}>
        <OwieButton title="Back" onPress={() => go('dev')} />
      </View>
      <OwieCard>
        <Text style={styles.stats}>
          Packet stats (placeholder): <Text style={styles.bold}>0</Text> frames
        </Text>
      </OwieCard>
    </>
  );
}

const styles = StyleSheet.create({
  term: {
    minHeight: 200,
    padding: 10,
    backgroundColor: '#ffffff',
    color: owie.textPrimary,
    borderWidth: 1,
    borderColor: owie.border,
    borderRadius: 10,
    width: '100%' as const,
    marginBottom: 8,
    textAlignVertical: 'top' as const,
    fontSize: 13,
  },
  row: { marginTop: 8, width: '100%' as const },
  stats: { color: owie.textMuted, fontSize: 13, fontFamily: bodyFont },
  bold: { fontWeight: '700' as const, color: owie.textPrimary, fontFamily: bodyFont },
});
