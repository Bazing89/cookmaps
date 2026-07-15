import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/** Embedded-style display colors: green/amber on near-black, easy to retune to match your board. */
const lcd = {
  displayBg: '#050806',
  bezel: '#121814',
  bezelBorder: '#1e2a22',
  textDim: '#1f6b3a',
  textMain: '#2ee85c',
  textBright: '#7bff9e',
  labelMuted: '#2d5a3c',
  cursor: '#2ee85c',
} as const;

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function formatOctet(v: number, pad3: boolean) {
  return pad3 ? String(v).padStart(3, '0') : String(v);
}

function formatDotted(octets: readonly [number, number, number, number], pad3: boolean) {
  return octets.map((o) => formatOctet(o, pad3)).join('.');
}

export type FirmwareStyleIpPanelProps = {
  /** When true, each octet is shown as 000–255 to mirror many OLED menus. */
  padOctets?: boolean;
  /** Shown in the status row (e.g. “STA” / “AP”). */
  modeLabel?: string;
  /** Current address (controlled). */
  ip: readonly [number, number, number, number];
  /** Shown on second line like many firmwares (read-only; wire from BLE when ready). */
  gatewayText?: string;
  netmaskText?: string;
  onIpChange: (ip: readonly [number, number, number, number]) => void;
};

export function FirmwareStyleIpPanel({
  padOctets = false,
  modeLabel = 'IP',
  ip,
  gatewayText = '192.168.1.1',
  netmaskText = '255.255.255.0',
  onIpChange,
}: FirmwareStyleIpPanelProps) {
  const [octetIndex, setOctetIndex] = useState(0);

  const setIpP = useCallback(
    (next: [number, number, number, number]) => {
      onIpChange(next);
    },
    [onIpChange]
  );

  const bumpValue = (delta: number) => {
    const next = [...ip] as [number, number, number, number];
    next[octetIndex] = clampByte(next[octetIndex] + delta);
    setIpP(next);
  };

  const nextOctet = (dir: -1 | 1) => {
    setOctetIndex((i) => (i + dir + 4) % 4);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bezel}>
        <View style={styles.chinRow}>
          <Text style={styles.chinDot}>●</Text>
          <Text style={styles.chinDotDim}>○</Text>
        </View>

        <View style={styles.lcd}>
          <View style={styles.titleRow}>
            <Text style={styles.titleLcd}>{modeLabel}</Text>
            <Text style={styles.titleLcdDim}>SAVED</Text>
          </View>

          <View style={styles.mainRow}>
            {([0, 1, 2, 3] as const).map((i) => {
              const selected = i === octetIndex;
              const v = formatOctet(ip[i], padOctets);
              return (
                <View key={i} style={styles.octetGroup}>
                  {i > 0 ? (
                    <Text style={styles.dot} accessibilityLabel="dot">
                      {'\u00B7'}
                    </Text>
                  ) : null}
                  <Pressable
                    onPress={() => setOctetIndex(i)}
                    style={[styles.octetBox, selected && styles.octetBoxActive]}
                    accessibilityLabel={`Octet ${i + 1}, ${v}`}
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[styles.octetText, selected && styles.octetTextActive]}
                      numberOfLines={1}
                    >
                      {v}
                    </Text>
                    {selected ? <View style={styles.cursor} /> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.subRow}>
            <Text style={styles.subKey}>GW</Text>
            <Text style={styles.subVal} numberOfLines={1} ellipsizeMode="tail">
              {gatewayText}
            </Text>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.subKey}>NM</Text>
            <Text style={styles.subVal} numberOfLines={1} ellipsizeMode="tail">
              {netmaskText}
            </Text>
          </View>

          <Text style={styles.rawEcho}>{formatDotted(ip, padOctets)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.ctrlRow}>
          <Pressable
            onPress={() => nextOctet(-1)}
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            accessibilityLabel="Previous octet"
          >
            <Text style={styles.btnText}>◀</Text>
          </Pressable>
          <View style={styles.btnLabelWrap}>
            <Text style={styles.btnLabel}>OCTET</Text>
            <Text style={styles.octetHint}>{octetIndex + 1} / 4</Text>
          </View>
          <Pressable
            onPress={() => nextOctet(1)}
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            accessibilityLabel="Next octet"
          >
            <Text style={styles.btnText}>▶</Text>
          </Pressable>
        </View>
        <View style={styles.ctrlRow}>
          <Pressable
            onPress={() => bumpValue(-1)}
            style={({ pressed }) => [styles.btnWide, pressed && styles.btnPressed]}
            accessibilityLabel="Decrease value"
          >
            <Text style={styles.btnText}>−</Text>
          </Pressable>
          <Pressable
            onPress={() => bumpValue(1)}
            style={({ pressed }) => [styles.btnWide, pressed && styles.btnPressed]}
            accessibilityLabel="Increase value"
          >
            <Text style={styles.btnText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  bezel: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: lcd.bezelBorder,
    backgroundColor: lcd.bezel,
    overflow: 'hidden',
  },
  chinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  chinDot: { fontSize: 7, color: lcd.textMain },
  chinDotDim: { fontSize: 7, color: lcd.textDim },
  lcd: {
    backgroundColor: lcd.displayBg,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleLcd: {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 2,
    color: lcd.textDim,
    textTransform: 'uppercase',
  },
  titleLcdDim: {
    fontFamily: mono,
    fontSize: 9,
    color: '#12381f',
  },
  mainRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  octetGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dot: {
    fontFamily: mono,
    fontSize: 28,
    lineHeight: 32,
    color: lcd.textDim,
    marginHorizontal: 1,
  },
  octetBox: {
    minWidth: 48,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  octetBoxActive: {
    backgroundColor: 'rgba(46, 232, 92, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46, 232, 92, 0.35)',
  },
  octetText: {
    fontFamily: mono,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '600',
    color: lcd.textMain,
  },
  octetTextActive: {
    color: lcd.textBright,
  },
  cursor: {
    marginTop: 2,
    height: 2,
    backgroundColor: lcd.cursor,
    borderRadius: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  subKey: {
    fontFamily: mono,
    fontSize: 11,
    color: lcd.labelMuted,
    width: 22,
  },
  subVal: {
    flex: 1,
    fontFamily: mono,
    fontSize: 14,
    color: lcd.textDim,
  },
  rawEcho: {
    marginTop: 10,
    fontFamily: mono,
    fontSize: 10,
    color: '#12381f',
    letterSpacing: 1,
  },
  controls: {
    gap: 10,
  },
  ctrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  btn: {
    minWidth: 52,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#1e2a32',
    borderWidth: 1,
    borderColor: '#2a3a45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWide: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#1e2a32',
    borderWidth: 1,
    borderColor: '#2a3a45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: '#2a3d4a',
  },
  btnText: {
    fontSize: 22,
    color: '#c8d6e0',
    fontWeight: '500',
  },
  btnLabelWrap: { alignItems: 'center', minWidth: 80 },
  btnLabel: {
    fontSize: 10,
    color: '#5c6b7a',
    letterSpacing: 1,
  },
  octetHint: {
    fontFamily: mono,
    fontSize: 12,
    color: '#8b9cb3',
    marginTop: 2,
  },
});
