import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BleManager } from 'react-native-ble-plx';
import { OwieButton } from '../components/owie/OwieButton';
import { getBleManager, isBleAvailable } from '../lib/blePlx';
import { bodyFont, theme } from '../theme/owieTheme';

type Dev = { id: string; name: string | null; rssi: number | null };

type Props = {
  onConnected: (device: { id: string; name: string | null }) => void;
  onDemo: () => void;
};

/** BLE advertisements can arrive hundreds of times per second; batching avoids UI thrash. */
const DEVICE_SCAN_UI_INTERVAL_MS = 200;

const styles = StyleSheet.create({
  centerBlock: { width: '100%' as const, alignItems: 'center' as const, paddingTop: 8 },
  block: { width: '100%' as const, minHeight: 0 },
  h1: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: bodyFont,
  },
  mutedCenter: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: bodyFont,
  },
  mutedLine: { color: theme.textMuted, fontSize: 14, marginTop: 4, fontFamily: bodyFont },
  errLine: { color: theme.danger, fontSize: 14, marginTop: 8, textAlign: 'center', fontFamily: bodyFont },
  tinyCenter: { color: theme.textDim, fontSize: 12, fontFamily: bodyFont },
  rowActions: { marginTop: 12, width: '100%' as const },
  rowScan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mutedLineScan: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 10,
    fontFamily: bodyFont,
  },
  p: { height: 12 },
  list: { marginTop: 12, flex: 1, width: '100%' as const, minHeight: 120 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.tdValueBg,
    marginBottom: 8,
  },
  itemTitle: { color: theme.text, fontSize: 16, fontWeight: '600' as const, fontFamily: bodyFont },
  itemSub: { color: theme.textMuted, fontSize: 12, marginTop: 2, fontFamily: bodyFont },
});

type DeviceRowProps = {
  item: Dev;
  busy: boolean;
  disabled: boolean;
  onPress: (d: Dev) => void;
};

const DeviceRow = memo(function DeviceRow({ item, busy, disabled, onPress }: DeviceRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.item,
        pressed && { opacity: 0.75 },
        busy && { opacity: 0.5 },
      ]}
      disabled={disabled}
    >
      {busy ? <ActivityIndicator color={theme.text} style={{ marginRight: 10 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name || '(No name)'}</Text>
        <Text style={styles.itemSub} numberOfLines={1}>
          {item.id}
          {item.rssi != null ? ` · ${item.rssi} dBm` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textDim} />
    </Pressable>
  );
});

export function BleConnectScreen({ onConnected, onDemo }: Props) {
  const web = Platform.OS === 'web';
  const noModule = !isBleAvailable();
  const [expoGoBlocked, setExpoGoBlocked] = useState(false);
  const [adapterState, setAdapterState] = useState('…');
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, Dev>>({});
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const managerRef = useRef<BleManager | null>(null);
  const scanEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const devicesDraftRef = useRef<Record<string, Dev>>({});
  const flushScanUiRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushScanDevicesToState = useCallback(() => {
    if (flushScanUiRef.current) {
      clearTimeout(flushScanUiRef.current);
      flushScanUiRef.current = null;
    }
    setDevices({ ...devicesDraftRef.current });
  }, []);

  const scheduleScanDevicesFlush = useCallback(() => {
    if (flushScanUiRef.current !== null) return;
    flushScanUiRef.current = setTimeout(() => {
      flushScanUiRef.current = null;
      setDevices({ ...devicesDraftRef.current });
    }, DEVICE_SCAN_UI_INTERVAL_MS);
  }, []);

  useEffect(() => {
    if (web || noModule) {
      setAdapterState('—');
      return;
    }
    let m: BleManager | null = null;
    let sub: { remove: () => void } | null = null;
    try {
      m = getBleManager();
      managerRef.current = m;
      sub = m?.onStateChange((s) => setAdapterState(String(s)), true) ?? null;
    } catch {
      setExpoGoBlocked(true);
      setAdapterState('Unavailable');
      return;
    }
    return () => {
      sub?.remove();
      m?.stopDeviceScan();
      if (flushScanUiRef.current) {
        clearTimeout(flushScanUiRef.current);
        flushScanUiRef.current = null;
      }
    };
  }, [web, noModule]);

  const stopScan = useCallback(() => {
    managerRef.current?.stopDeviceScan();
    if (scanEndRef.current) {
      clearTimeout(scanEndRef.current);
      scanEndRef.current = null;
    }
    flushScanDevicesToState();
    setScanning(false);
  }, [flushScanDevicesToState]);

  const startScan = useCallback(() => {
    if (web || noModule) return;
    const m = managerRef.current;
    if (!m) {
      setErr('Bluetooth not ready.');
      return;
    }
    if (adapterState !== 'PoweredOn') {
      setErr('Enable Bluetooth, then try again.');
      return;
    }
    setErr(null);
    m.stopDeviceScan();
    devicesDraftRef.current = {};
    flushScanDevicesToState();
    setScanning(true);
    // Fewer native callbacks than allowDuplicates: true; RSSI still updates when duplicates occur on some stacks.
    m.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        setErr(error.message);
        return;
      }
      if (!device) return;
      const name = device.name ?? device.localName ?? null;
      const rssi = device.rssi ?? null;
      devicesDraftRef.current[device.id] = { id: device.id, name, rssi };
      scheduleScanDevicesFlush();
    });
    if (scanEndRef.current) clearTimeout(scanEndRef.current);
    scanEndRef.current = setTimeout(() => {
      stopScan();
    }, 12000);
  }, [adapterState, flushScanDevicesToState, noModule, scheduleScanDevicesFlush, stopScan, web]);

  const onPickDevice = useCallback(
    async (d: Dev) => {
      if (web || noModule) return;
      const m = managerRef.current;
      if (!m) return;
      stopScan();
      setErr(null);
      setConnectingId(d.id);
      try {
        const device = await m.connectToDevice(d.id);
        await device.discoverAllServicesAndCharacteristics();
        onConnected({
          id: device.id,
          name: device.name ?? device.localName ?? d.name,
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Connection failed');
      } finally {
        setConnectingId(null);
      }
    },
    [noModule, onConnected, stopScan, web],
  );

  const list = useMemo(
    () =>
      Object.values(devices).sort(
        (a, b) => (b.rssi ?? -200) - (a.rssi ?? -200),
      ),
    [devices],
  );

  const renderDevice = useCallback(
    ({ item }: { item: Dev }) => (
      <DeviceRow
        item={item}
        busy={connectingId === item.id}
        disabled={connectingId != null}
        onPress={onPickDevice}
      />
    ),
    [connectingId, onPickDevice],
  );

  const listEmptyStyle = list.length === 0 ? styles.listEmpty : { paddingBottom: 8 };

  if (web || noModule || expoGoBlocked) {
    return (
      <View style={styles.centerBlock}>
        <Ionicons name="bluetooth-outline" size={56} color={theme.textDim} style={{ marginBottom: 12 }} />
        <Text style={styles.h1}>Connect</Text>
        <Text style={styles.mutedCenter}>
          {web
            ? 'Bluetooth is not available in the browser. Use the mobile app, or try demo mode below.'
            : expoGoBlocked || noModule
              ? 'BLE needs a development build of this app (Expo Go does not load react-native-ble-plx). Use Continue for the UI, or run a dev build on a real phone.'
              : 'Could not use Bluetooth on this build.'}
        </Text>
        <View style={styles.p} />
        <Text style={styles.tinyCenter}>Adapter: {adapterState}</Text>
        <View style={styles.p} />
        <OwieButton title="Continue to data (demo)" onPress={onDemo} />
      </View>
    );
  }

  return (
    <View className="min-h-0 w-full flex-1" style={styles.block}>
      <Ionicons name="bluetooth" size={40} color={theme.text} style={{ alignSelf: 'center', marginBottom: 8 }} />
      <Text style={styles.h1}>Connect to device</Text>
      <Text style={styles.mutedLine}>Adapter: {adapterState}</Text>
      {err ? <Text style={styles.errLine}>{err}</Text> : null}
      <View style={styles.rowActions}>
        <OwieButton
          title={scanning ? 'Stop scan' : 'Scan for devices'}
          onPress={scanning ? stopScan : startScan}
        />
      </View>
      {scanning ? (
        <View style={styles.rowScan}>
          <ActivityIndicator color={theme.text} />
          <Text style={styles.mutedLineScan}>Scanning (12s)…</Text>
        </View>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        style={styles.list}
        contentContainerStyle={listEmptyStyle}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        ListEmptyComponent={
          <Text style={styles.mutedLine}>No devices found yet. Start a scan, then select your board.</Text>
        }
        renderItem={renderDevice}
      />
      <View style={styles.p} />
      <OwieButton variant="secondary" title="Use demo (no device)" onPress={onDemo} />
    </View>
  );
}
