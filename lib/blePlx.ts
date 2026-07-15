import type { BleManager } from 'react-native-ble-plx';

type BlePlx = typeof import('react-native-ble-plx');

let ble: BlePlx | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ble = require('react-native-ble-plx') as BlePlx;
} catch {
  ble = null;
}

export function getBlePlx(): BlePlx | null {
  return ble;
}

export function isBleAvailable(): boolean {
  return ble != null;
}

let manager: BleManager | null = null;

export function getBleManager(): BleManager | null {
  if (!ble) return null;
  if (!manager) {
    manager = new ble.BleManager();
  }
  return manager;
}

export function destroyBleManager(): void {
  manager?.destroy();
  manager = null;
}
