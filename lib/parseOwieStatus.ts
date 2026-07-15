export type OwieStatus = {
  totalVoltage: number | null;
  currentAmps: number | null;
  bmsSoc: number | null;
  overriddenSoc: number | null;
  usedChargeMah: number | null;
  regeneratedChargeMah: number | null;
  uptime: string | null;
  cellVoltages: number[];
  temperatures: number[];
  updatedAt: number;
};

function parseLeadingNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : null;
}

function parseHtmlTdValues(html: unknown): number[] {
  if (typeof html !== 'string' || !html) return [];
  const values: number[] = [];
  const re = /<td>\s*([^<]+)\s*<\/td>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const n = Number.parseFloat(match[1].trim());
    if (!Number.isNaN(n)) values.push(n);
  }
  return values;
}

export function parseOwieStatusJson(raw: unknown): OwieStatus | null {
  if (raw == null || typeof raw !== 'object') return null;
  const doc = raw as Record<string, unknown>;

  return {
    totalVoltage: parseLeadingNumber(doc.TOTAL_VOLTAGE),
    currentAmps: parseLeadingNumber(doc.CURRENT_AMPS),
    bmsSoc: parseLeadingNumber(doc.BMS_SOC),
    overriddenSoc: parseLeadingNumber(doc.OVERRIDDEN_SOC),
    usedChargeMah: parseLeadingNumber(doc.USED_CHARGE_MAH),
    regeneratedChargeMah: parseLeadingNumber(doc.REGENERATED_CHARGE_MAH),
    uptime: typeof doc.UPTIME === 'string' ? doc.UPTIME : null,
    cellVoltages: parseHtmlTdValues(doc.CELL_VOLTAGE_TABLE),
    temperatures: parseHtmlTdValues(doc.TEMPERATURE_TABLE),
    updatedAt: Date.now(),
  };
}

export function formatVoltage(value: number | null, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

export function formatCurrent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(1);
}

export function formatInteger(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return String(Math.round(value));
}

export function formatTemps(temps: number[]): string {
  if (temps.length === 0) return '—';
  return temps.map((t) => `${t}°C`).join(' / ');
}
