/**
 * Must match `include/ble_config.h` on the ESP32 firmware.
 * If notifications never arrive, verify these UUIDs against your board.
 */
export const OWIE_BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const OWIE_BLE_DATA_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

/** Chunk wire format: 5-byte header + up to 15 bytes payload (ATT MTU 20). */
export const OWIE_BLE_CHUNK_HEADER_BYTES = 5;
export const OWIE_BLE_MAX_PAYLOAD_PER_CHUNK = 15;

/** Must match `OwieBleStreamType` in firmware. */
export const OwieBleStreamType = {
  STATUS_JSON: 0x01,
  RAW_BMS: 0x02,
} as const;
