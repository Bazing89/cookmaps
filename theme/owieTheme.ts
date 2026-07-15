import { Platform } from 'react-native';

/** Clean black & white / neutral grayscale theme. */
export const theme = {
  bg: '#000000',
  /** Main elevated surface (cards, header bar) */
  surface: '#0a0a0a',
  surface2: '#111111',
  border: '#2a2a2a',
  borderSubtle: '#1f1f1f',
  text: '#ffffff',
  textMuted: '#9a9a9a',
  textDim: '#6b6b6b',
  tdValueBg: '#0d0d0d',
  tdBorder: '#2e2e2e',
  cellBg: '#0f0f0f',
  cellBorder: '#333333',
  /** Primary action (inverted) */
  buttonBg: '#ffffff',
  buttonText: '#0a0a0a',
  buttonPressed: '#d4d4d4',
  /** Secondary (outline) */
  outline: '#3d3d3d',
  ok: '#34c759',
  danger: '#ff453a',
  // Aliases for older component property names
  bgMain: '#000000',
  bgSurface: '#0a0a0a',
  bgSurface2: '#111111',
  bgInput: '#0d0d0d',
  textPrimary: '#ffffff',
} as const;

export const bodyFont = Platform.select({
  web: 'system-ui, -apple-system, "Segoe UI", sans-serif' as const,
  default: undefined,
});

/** @deprecated use `theme` */
export const owie = theme;
