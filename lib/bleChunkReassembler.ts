type PendingMessage = {
  type: number;
  msgId: number;
  fragCount: number;
  parts: Map<number, Uint8Array>;
};

function messageKey(type: number, msgId: number): string {
  return `${type}:${msgId}`;
}

export class BleChunkReassembler {
  private pending = new Map<string, PendingMessage>();

  /** Feed one 20-byte (or shorter) GATT notification; returns full payload when complete. */
  push(chunk: Uint8Array): { type: number; payload: Uint8Array } | null {
    if (chunk.length < 5) return null;

    const type = chunk[0];
    const msgId = chunk[1] | (chunk[2] << 8);
    const fragIndex = chunk[3];
    const fragCount = chunk[4];
    const payload = chunk.subarray(5);

    if (fragCount === 0 || fragIndex >= fragCount) return null;

    const key = messageKey(type, msgId);
    let msg = this.pending.get(key);
    if (!msg) {
      msg = { type, msgId, fragCount, parts: new Map() };
      this.pending.set(key, msg);
    }

    msg.parts.set(fragIndex, payload);

    if (msg.parts.size < fragCount) return null;

    let totalLen = 0;
    for (let i = 0; i < fragCount; i++) {
      const part = msg.parts.get(i);
      if (!part) {
        this.pending.delete(key);
        return null;
      }
      totalLen += part.length;
    }

    const out = new Uint8Array(totalLen);
    let offset = 0;
    for (let i = 0; i < fragCount; i++) {
      const part = msg.parts.get(i)!;
      out.set(part, offset);
      offset += part.length;
    }

    this.pending.delete(key);
    return { type, payload: out };
  }
}

export function base64ToBytes(base64: string | null): Uint8Array | null {
  if (!base64) return null;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
