import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { OwieButton } from '../components/owie/OwieButton';
import { OwieFieldset } from '../components/owie/OwieFieldset';
import { OwieHeader } from '../components/owie/OwieHeader';
import { bodyFont, owie } from '../theme/owieTheme';
import type { OwieScreen } from './types';

type Props = { go: (s: OwieScreen) => void };

const input = {
  borderWidth: 1,
  borderColor: owie.border,
  borderRadius: 8,
  padding: 8,
  backgroundColor: owie.bgInput,
  color: owie.textPrimary,
} as const;

export function SettingsScreen({ go }: Props) {
  const [apName, setApName] = useState('Owie_AP');
  const [pw, setPw] = useState('');
  const [wifip, setWifip] = useState('8.5');

  return (
    <>
      <OwieHeader title="Owie Settings" subtitle="(NexusOwie-BLE)" />
      <View style={styles.form}>
        <OwieFieldset legend="WiFi options:">
          <Text style={styles.p}>Owie WiFi network name override:{'\n'}</Text>
          <TextInput
            style={[styles.inp, { fontFamily: bodyFont }]}
            placeholder="WiFi network name"
            placeholderTextColor={owie.textMuted}
            value={apName}
            onChangeText={setApName}
          />
          <Text style={styles.p2}>Password:</Text>
          <TextInput
            style={[styles.inp, { fontFamily: bodyFont }]}
            placeholder="Between 8 and 31 characters"
            placeholderTextColor={owie.textMuted}
            value={pw}
            onChangeText={setPw}
            secureTextEntry
          />
          <Text style={styles.p2}>Power (dBm):</Text>
          <TextInput
            style={[styles.inp, { fontFamily: bodyFont }]}
            value={wifip}
            onChangeText={setWifip}
            keyboardType="decimal-pad"
          />
        </OwieFieldset>
        <OwieFieldset legend="Board locking:">
          <Text style={styles.mutedP}>
            First set WiFi password above and save settings to enable board locking.
          </Text>
        </OwieFieldset>
        <OwieFieldset legend="Firmware Update:">
          <Text style={styles.mutedP}>
            On device, you can upload a .bin from the portal. (Not wired in the mobile shell yet.)
          </Text>
        </OwieFieldset>
        <View style={styles.hr} />
        <OwieButton
          title="Save"
          onPress={() => {
            // placeholder — later POST to /settings
          }}
        />
      </View>
      <View style={styles.p} />
      <OwieButton title="Developer Settings" onPress={() => go('dev')} />
      <View style={styles.p} />
      <OwieButton title="Back" onPress={() => go('status')} />
    </>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' as const },
  p: { margin: 0, marginTop: 8, color: owie.textMuted, fontSize: 14, fontFamily: bodyFont },
  p2: { marginTop: 8, color: owie.textMuted, fontSize: 14, fontFamily: bodyFont },
  inp: { marginTop: 4, width: '100%' as const, minHeight: 40, ...input },
  hr: { height: 1, backgroundColor: owie.tdBorder, marginVertical: 12, width: '100%' as const },
  mutedP: { color: owie.textMuted, fontSize: 14, lineHeight: 20, fontFamily: bodyFont },
});
