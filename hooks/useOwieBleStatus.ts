import { useEffect, useState } from 'react';
import type { Device } from 'react-native-ble-plx';
import { getBleManager, isBleAvailable } from '../lib/blePlx';
import type { OwieBleConnectionState, OwieBleMonitor } from '../lib/owieBleTransport';
import { startOwieBleMonitor } from '../lib/owieBleTransport';
import type { OwieStatus } from '../lib/parseOwieStatus';

type Options = {
  deviceId: string | null;
  enabled: boolean;
};

export function useOwieBleStatus({ deviceId, enabled }: Options) {
  const [status, setStatus] = useState<OwieStatus | null>(null);
  const [connectionState, setConnectionState] = useState<OwieBleConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !deviceId || deviceId === 'demo' || !isBleAvailable()) {
      setStatus(null);
      setConnectionState('idle');
      setError(null);
      return;
    }

    const manager = getBleManager();
    if (!manager) {
      setConnectionState('error');
      setError('Bluetooth module unavailable.');
      return;
    }

    let cancelled = false;
    let monitor: OwieBleMonitor | null = null;

    (async () => {
      setStatus(null);
      setConnectionState('connecting');
      setError(null);
      try {
        const device: Device = await manager.connectToDevice(deviceId, { autoConnect: false });
        if (cancelled) {
          await device.cancelConnection();
          return;
        }

        monitor = await startOwieBleMonitor(
          device,
          (next) => {
            if (!cancelled) setStatus(next);
          },
          (message) => {
            if (!cancelled) setError(message);
          },
        );

        if (cancelled) {
          await monitor.disconnect();
          return;
        }

        setConnectionState('connected');
      } catch (e) {
        if (!cancelled) {
          setConnectionState('error');
          setError(e instanceof Error ? e.message : 'BLE connection failed');
        }
      }
    })();

    return () => {
      cancelled = true;
      void monitor?.disconnect();
    };
  }, [deviceId, enabled]);

  return { status, connectionState, error };
}
