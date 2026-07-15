import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { OwieButton } from '../components/owie/OwieButton';
import { OwieCard } from '../components/owie/OwieCard';
import { OwieHeader } from '../components/owie/OwieHeader';
import { bodyFont, owie } from '../theme/owieTheme';
import type { OwieScreen } from './types';

const inp = {
  borderWidth: 1,
  borderColor: owie.border,
  borderRadius: 8,
  padding: 8,
  backgroundColor: owie.bgInput,
  color: owie.textPrimary,
} as const;

type Props = { go: (s: OwieScreen) => void };

export function WifiScreen({ go }: Props) {
  const [ssid, setSsid] = useState('');
  const [pass, setPass] = useState('');

  return (
    <>
      <OwieHeader title="Owie Settings" subtitle="(NexusOwie-BLE)" />
      <OwieCard>
        <Text style={styles.mutedP}>
          WiFi Network <Text style={styles.bold}>to connect to</Text>
        </Text>
        <TextInput
          style={[styles.input, { fontFamily: bodyFont }]}
          placeholder="Type or Select your WiFi Network"
          placeholderTextColor={owie.textMuted}
          value={ssid}
          onChangeText={setSsid}
          autoCapitalize="none"
        />
        <Text style={styles.mutedP2}>
          <Text style={styles.bold}>WiFi Password</Text>
        </Text>
        <TextInput
          style={[styles.input, { fontFamily: bodyFont }]}
          placeholder="Enter your WiFi Password"
          placeholderTextColor={owie.textMuted}
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />
        <OwieButton title="Save" onPress={() => {}} />
      </OwieCard>
      <View style={styles.p} />
      <OwieButton title="Back" onPress={() => go('dev')} />
    </>
  );
}

const styles = StyleSheet.create({
  p: { height: 8 },
  bold: { fontWeight: '700' as const, color: owie.textPrimary, fontFamily: bodyFont },
  mutedP: { color: owie.textMuted, fontSize: 14, lineHeight: 20, fontFamily: bodyFont, marginBottom: 6 },
  mutedP2: { color: owie.textMuted, fontSize: 14, marginTop: 10, fontFamily: bodyFont, marginBottom: 6 },
  input: { width: '100%' as const, minHeight: 40, marginBottom: 8, marginTop: 4, ...inp },
});
