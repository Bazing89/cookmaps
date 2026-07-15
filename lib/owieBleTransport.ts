import type { Device, Subscription } from 'react-native-ble-plx';
import {
  OWIE_BLE_DATA_CHAR_UUID,
  OWIE_BLE_SERVICE_UUID,
  OwieBleStreamType,
} from './bleConfig';
import { BleChunkReassembler, base64ToBytes } from './bleChunkReassembler';
import { parseOwieStatusJson, type OwieStatus } from './parseOwieStatus';

export type OwieBleConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

async function findDataCharacteristic(device: Device): Promise<{ serviceUuid: string; charUuid: string }> {
  await device.discoverAllServicesAndCharacteristics();

  try {
    const chars = await device.characteristicsForService(OWIE_BLE_SERVICE_UUID);
    const dataChar = chars.find(
      (c) => c.uuid.toLowerCase() === OWIE_BLE_DATA_CHAR_UUID.toLowerCase() && c.isNotifiable,
    );
    if (dataChar) {
      return { serviceUuid: OWIE_BLE_SERVICE_UUID, charUuid: dataChar.uuid };
    }
  } catch {
    // Fall through to heuristic discovery.
  }

  const services = await device.services();
  for (const svc of services) {
    if (svc.uuid.toLowerCase().startsWith('0000180')) continue;
    const chars = await device.characteristicsForService(svc.uuid);
    const dataChar = chars.find((c) => c.isNotifiable);
    if (dataChar) {
      return { serviceUuid: svc.uuid, charUuid: dataChar.uuid };
    }
  }

  throw new Error('No Owie BLE data characteristic found. Check bleConfig.ts UUIDs.');
}

export type OwieBleMonitor = {
  subscription: Subscription;
  disconnect: () => Promise<void>;
};

export async function startOwieBleMonitor(
  device: Device,
  onStatus: (status: OwieStatus) => void,
  onError?: (message: string) => void,
): Promise<OwieBleMonitor> {
  const { serviceUuid, charUuid } = await findDataCharacteristic(device);
  const reassembler = new BleChunkReassembler();
  const decoder = new TextDecoder();

  const subscription = device.monitorCharacteristicForService(
    serviceUuid,
    charUuid,
    (error, characteristic) => {
      if (error) {
        onError?.(error.message);
        return;
      }
      const bytes = base64ToBytes(characteristic?.value ?? null);
      if (!bytes) return;

      const message = reassembler.push(bytes);
      if (!message) return;

      const looksLikeJson =
        message.type === OwieBleStreamType.STATUS_JSON ||
        message.type === 0 ||
        message.payload[0] === 0x7b;
      if (!looksLikeJson) return;

      try {
        const jsonText = decoder.decode(message.payload);
        const parsed = JSON.parse(jsonText) as unknown;
        const status = parseOwieStatusJson(parsed);
        if (status) onStatus(status);
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Failed to parse status JSON');
      }
    },
  );

  return {
    subscription,
    disconnect: async () => {
      subscription.remove();
      try {
        await device.cancelConnection();
      } catch {
        // Already disconnected.
      }
    },
  };
}
